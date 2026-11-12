// Marikomerc: dnevni javni cjenik (sidrene cijene) za maloprodaju T003.
// Izvor je VENIO API (JSON), mi ga pretvaramo u CSV i čuvamo u Netlify Blobs.
// Sve funkcije ovdje primaju `store` (Netlify Blobs store ili lokalna zamjena),
// pa se ista logika može provjeriti i lokalno.

import { createHash } from "node:crypto";

export const STORE_NAME = "marikomerc-cjenik";

export const POSLOVNICA = {
  code: "T003",
  vrsta: "prodavaonica",
  name: "Marikomerc Poličnik",
  address: "Grabi 54, 23241 Poličnik",
};

export const CSV_SEPARATOR = ";";

export const CSV_HEADER = [
  "sifra_artikla",
  "naziv_artikla",
  "marka",
  "jedinica_mjere",
  "cijena_za_jedinicu_mjere",
  "maloprodajna_cijena",
  "poseban_oblik_prodaje",
  "naziv_posebnog_oblika_prodaje",
  "sidrena_cijena",
  "datum_sidrene_cijene",
  "barkod",
  "dostupnost",
];

// Objave se čuvaju najmanje 30 dana; brišemo tek starije od 31 dan.
export const RETENTION_DAYS = 31;

// Ako je neispravno više od ovog udjela artikala, ne objavljujemo ništa
// (zadnji ispravni cjenik ostaje javan).
const MAX_UDIO_NEISPRAVNIH = 0.1;

const STANJE_KEY = "stanje.json";
const objavaKey = (broj) => `objave/${String(broj).padStart(6, "0")}.csv`;

// ---------------------------------------------------------------------------
// Vrijeme (Europe/Zagreb)

function zagrebParts(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const v = (type) => parts.find((part) => part.type === type)?.value;
  const p = { y: v("year"), m: v("month"), d: v("day"), hh: v("hour"), mm: v("minute"), ss: v("second") };
  const zonedUtc = Date.UTC(+p.y, +p.m - 1, +p.d, +p.hh, +p.mm, +p.ss);
  const offset = Math.round((zonedUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  const abs = Math.abs(offset);
  p.offset = `${offset >= 0 ? "+" : "-"}${String(Math.floor(abs / 60)).padStart(2, "0")}${String(abs % 60).padStart(2, "0")}`;
  return p;
}

// "2026-11-13" (datum za VENIO poziv)
export function zagrebDatum(date = new Date()) {
  const p = zagrebParts(date);
  return `${p.y}-${p.m}-${p.d}`;
}

// "20261113T063000+0100" (za naziv datoteke)
export function zagrebStamp(date = new Date()) {
  const p = zagrebParts(date);
  return `${p.y}${p.m}${p.d}T${p.hh}${p.mm}${p.ss}${p.offset}`;
}

// ---------------------------------------------------------------------------
// Naziv datoteke: {vrsta}_{adresa}_{oznaka}_{broj-pohrane}_{YYYYMMDDTHHmmss+ZZZZ}.csv

function ascii(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function nazivDatoteke({ broj, date }) {
  const adresa = ascii(POSLOVNICA.address)
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const brojPohrane = String(broj).padStart(6, "0");
  return `${POSLOVNICA.vrsta}_${adresa}_${POSLOVNICA.code}_${brojPohrane}_${zagrebStamp(date)}.csv`;
}

// ---------------------------------------------------------------------------
// VENIO JSON -> redovi CSV-a

// Polja čitamo bez obzira na velika/mala slova (ArtiklSifra, artiklSifra...).
function pick(obj, ...names) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const name of names) {
    if (name in obj) return obj[name];
  }
  const lower = Object.fromEntries(Object.keys(obj).map((key) => [key.toLowerCase(), key]));
  for (const name of names) {
    const key = lower[name.toLowerCase()];
    if (key !== undefined) return obj[key];
  }
  return undefined;
}

function hasField(obj, name) {
  return obj && typeof obj === "object" && Object.keys(obj).some((key) => key.toLowerCase() === name.toLowerCase());
}

function broj(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function cijena(n) {
  return n === null ? "" : n.toFixed(2);
}

function datum(value) {
  if (!value) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  return match ? match[1] : "";
}

function daNe(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const text = String(value ?? "").trim().toLowerCase();
  if (["true", "da", "1", "yes"].includes(text)) return true;
  if (["false", "ne", "0", "no"].includes(text)) return false;
  return null;
}

const JEDINICE = {
  kg: "kg",
  kgr: "kg",
  l: "l",
  lit: "l",
  ltr: "l",
  kom: "kom",
  ko: "kom",
  kos: "kom",
  pce: "kom",
  kut: "kut",
  pak: "pak",
};

function jedinica(code) {
  const key = String(code ?? "").trim().toLowerCase().replace(/\.$/, "");
  return JEDINICE[key] || key;
}

// Pronađi stavke grupe u kojoj je skladište T003.
export function stavkeZaPoslovnicu(json, sifraSkladista = POSLOVNICA.code) {
  const grupe = Array.isArray(json) ? json : pick(json, "WebCjenikGrupa", "Grupe", "Data", "Result") || [];
  if (!Array.isArray(grupe)) {
    throw new Error("VENIO odgovor nije niz grupa.");
  }

  for (const grupa of grupe) {
    const skladista = [].concat(pick(grupa, "Skladista", "Skladiste") || []);
    const imaSkladiste = skladista.some(
      (s) => String(pick(s, "SkladisteSifra", "Sifra", "SifraSkladista") ?? s).trim() === sifraSkladista
    );
    if (imaSkladiste) {
      const stavke = pick(grupa, "Stavke", "Artikli", "Items");
      if (!Array.isArray(stavke)) throw new Error("Grupa za skladište nema niz stavki.");
      return stavke;
    }
  }

  throw new Error(`U VENIO odgovoru nema grupe za skladište ${sifraSkladista}.`);
}

// Jedna VENIO stavka -> red CSV-a (objekt s CSV_HEADER ključevima) + upozorenja.
export function mapirajStavku(stavka) {
  const upozorenja = [];
  const sifra = String(pick(stavka, "ArtiklSifra") ?? "").trim();
  const naziv = String(pick(stavka, "ArtiklNaziv") ?? "").trim();
  const jm = jedinica(pick(stavka, "JedinicaMjereSifra", "JedinicaMjere"));
  const redovna = broj(pick(stavka, "Cijena"));
  const akcijska = broj(pick(stavka, "AkcijskaCijena"));
  const akcija = akcijska !== null && akcijska > 0;
  const mpc = akcija ? akcijska : redovna;
  const sidrena = broj(pick(stavka, "SidrenaCijena"));
  const dostupno = daNe(pick(stavka, "Dostupno"));
  const brand = String(pick(stavka, "Brand") ?? "").trim();

  const greske = [];
  if (!sifra) greske.push("nema šifre");
  if (!naziv) greske.push("nema naziva");
  if (mpc === null || mpc <= 0) greske.push("nema cijene");
  if (dostupno === null) greske.push("nema dostupnosti");

  // Cijena za jedinicu mjere: za artikle na kg ili l jednaka je cijeni.
  // Za komadne artikle treba neto masa pakiranja, koju API (za sada) ne daje.
  let cijenaJm = "";
  if (mpc !== null && (jm === "kg" || jm === "l")) {
    cijenaJm = cijena(mpc);
  } else if (!akcija) {
    upozorenja.push("cijena_za_jedinicu_mjere");
  }
  if (sidrena === null) upozorenja.push("sidrena_cijena");
  if (!jm) upozorenja.push("jedinica_mjere");

  const red = {
    sifra_artikla: sifra,
    naziv_artikla: naziv,
    marka: brand || "Ostalo",
    jedinica_mjere: jm,
    cijena_za_jedinicu_mjere: cijenaJm,
    maloprodajna_cijena: cijena(mpc),
    poseban_oblik_prodaje: akcija ? "DA" : "NE",
    naziv_posebnog_oblika_prodaje: akcija ? "Akcija" : "",
    sidrena_cijena: cijena(sidrena),
    datum_sidrene_cijene: sidrena === null ? "" : datum(pick(stavka, "SidrenaCijenaDatum")),
    barkod: String(pick(stavka, "ArtiklBarkod") ?? "").trim(),
    dostupnost: dostupno ? "DOSTUPNO" : "NEDOSTUPNO",
  };

  return { red, greske, upozorenja };
}

// Cijeli VENIO odgovor -> { redovi, izvjestaj }. Baca grešku ako se ne smije objaviti.
export function pripremiCjenik(json) {
  const stavke = stavkeZaPoslovnicu(json);
  if (stavke.length === 0) {
    throw new Error("VENIO je vratio prazan cjenik.");
  }
  if (!stavke.some((stavka) => hasField(stavka, "Brand"))) {
    throw new Error("VENIO odgovor nema polje Brand (provjeriti grupaArtiklId=21&grupaNaziv=Brand).");
  }

  const redovi = [];
  const neispravni = [];
  const upozorenja = {};
  for (const stavka of stavke) {
    const { red, greske, upozorenja: u } = mapirajStavku(stavka);
    if (greske.length > 0) {
      neispravni.push({ sifra: red.sifra_artikla, greske });
      continue;
    }
    for (const polje of u) upozorenja[polje] = (upozorenja[polje] || 0) + 1;
    redovi.push(red);
  }

  if (redovi.length === 0 || neispravni.length / stavke.length > MAX_UDIO_NEISPRAVNIH) {
    const primjeri = neispravni.slice(0, 5).map((n) => `${n.sifra || "?"}: ${n.greske.join(", ")}`);
    throw new Error(`Previše neispravnih artikala (${neispravni.length} od ${stavke.length}). ${primjeri.join("; ")}`);
  }

  redovi.sort((a, b) => a.naziv_artikla.localeCompare(b.naziv_artikla, "hr"));

  return {
    redovi,
    izvjestaj: { ukupno: stavke.length, objavljeno: redovi.length, neispravni, upozorenja },
  };
}

// ---------------------------------------------------------------------------
// CSV

function csvPolje(value) {
  const text = String(value ?? "");
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function uCsv(redovi) {
  const lines = [CSV_HEADER.join(CSV_SEPARATOR)];
  for (const red of redovi) {
    lines.push(CSV_HEADER.map((key) => csvPolje(red[key])).join(CSV_SEPARATOR));
  }
  return `${lines.join("\r\n")}\r\n`;
}

const hash = (text) => createHash("sha256").update(text).digest("hex");

// ---------------------------------------------------------------------------
// Pohrana: stanje.json (brojač + popis objava) i objave/<broj>.csv

async function ucitajStanje(store) {
  const stanje = await store.get(STANJE_KEY, { type: "json" });
  return stanje && typeof stanje === "object" ? stanje : { zadnjiBroj: 0, objave: [] };
}

// Dohvati, pretvori i objavi. `dohvatiJson(datum)` vraća VENIO JSON.
// Na bilo kakvu grešku baca iznimku i NE dira zadnji ispravni cjenik.
export async function sinkroniziraj({ store, dohvatiJson, now = new Date() }) {
  const datumCjenika = zagrebDatum(now);
  const json = await dohvatiJson(datumCjenika);
  const { redovi, izvjestaj } = pripremiCjenik(json);
  const csv = uCsv(redovi);
  const csvHash = hash(csv);

  const stanje = await ucitajStanje(store);
  const zadnja = stanje.objave[stanje.objave.length - 1];

  // Isti sadržaj isti dan (npr. drugi jutarnji pokušaj): ne objavljujemo ponovno.
  if (zadnja && zadnja.hash === csvHash && zadnja.datum === datumCjenika) {
    return { objavljeno: false, razlog: "isti cjenik je danas već objavljen", zadnja, izvjestaj };
  }

  const broj = (stanje.zadnjiBroj || 0) + 1;
  const objava = {
    broj,
    filename: nazivDatoteke({ broj, date: now }),
    datum: datumCjenika,
    publishedAt: now.toISOString(),
    hash: csvHash,
    artikala: redovi.length,
  };

  // Prvo spremi datoteku, tek onda stanje, da popis nikad ne pokazuje na nepostojeću datoteku.
  await store.set(objavaKey(broj), csv);

  const cutoff = now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const zadrzi = [];
  const obrisi = [];
  for (const o of [...stanje.objave, objava]) {
    (Date.parse(o.publishedAt) < cutoff ? obrisi : zadrzi).push(o);
  }

  await store.setJSON(STANJE_KEY, { zadnjiBroj: broj, objave: zadrzi });

  for (const o of obrisi) {
    await store.delete(objavaKey(o.broj));
  }

  return { objavljeno: true, objava, obrisano: obrisi.length, izvjestaj };
}

// ---------------------------------------------------------------------------
// Čitanje za javne adrese

function javnaObjava(o) {
  return {
    filename: o.filename,
    broj: o.broj,
    datum: o.datum,
    publishedAt: o.publishedAt,
    artikala: o.artikala,
    url: `/cjenici/arhiva/${encodeURIComponent(o.filename)}`,
  };
}

export async function popis(store) {
  const stanje = await ucitajStanje(store);
  const objave = [...stanje.objave].reverse().map(javnaObjava);
  return {
    poslovnica: POSLOVNICA,
    latest: objave[0] ? { ...objave[0], aktualniUrl: "/cjenici/aktualni.csv" } : null,
    archive: objave,
  };
}

export async function procitajAktualni(store) {
  const stanje = await ucitajStanje(store);
  const zadnja = stanje.objave[stanje.objave.length - 1];
  if (!zadnja) return null;
  const csv = await store.get(objavaKey(zadnja.broj), { type: "text" });
  return csv ? { csv, filename: zadnja.filename } : null;
}

export async function procitajArhivu(store, filename) {
  const stanje = await ucitajStanje(store);
  const objava = stanje.objave.find((o) => o.filename === filename);
  if (!objava) return null;
  const csv = await store.get(objavaKey(objava.broj), { type: "text" });
  return csv ? { csv, filename: objava.filename } : null;
}
