// Marikomerc: dnevni javni cjenik (sidrene cijene) za maloprodaju T003.
// Izvor je VENIO API (JSON), mi ga pretvaramo u CSV i čuvamo u Netlify Blobs.
// Sve funkcije ovdje primaju `store` (Netlify Blobs store ili lokalna zamjena),
// pa se ista logika može provjeriti i lokalno.

import { createHash } from "node:crypto";

export const STORE_NAME = "marikomerc-cjenik";

// Šifra skladišta u VENIO-u (dio adrese API poziva).
export const VENIO_SKLADISTE = "T003";

// Podaci poslovnice za naziv datoteke. Prema Notion uputi dolaze iz Netlify
// varijabli (nazivi su preuzeti iz upute doslovno, iako počinju s DIMARIS_):
//   DIMARIS_STORE_TYPE      oblik prodajnog objekta
//   DIMARIS_STORE_ADDRESS   adresa prodajnog objekta
//   DIMARIS_STORE_CODE      oznaka prodajnog objekta
//   DIMARIS_STORAGE_NUMBER  broj pohrane (ako nije postavljen, koristi se redni broj objave)
//   MARIKOMERC_OIB          OIB trgovca na početku naziva (NN 132/2026, čl. 6.3)
const ZADANA_POSLOVNICA = {
  oib: "02359254184",
  vrsta: "prodavaonica",
  address: "Grabi 54, 23241 Poličnik",
  code: "T003",
  brojPohrane: "",
};

export function poslovnica(env = process.env) {
  const v = (name, fallback) => String(env[name] ?? "").trim() || fallback;
  return {
    name: "Marikomerc Poličnik",
    oib: v("MARIKOMERC_OIB", ZADANA_POSLOVNICA.oib),
    vrsta: v("DIMARIS_STORE_TYPE", ZADANA_POSLOVNICA.vrsta),
    address: v("DIMARIS_STORE_ADDRESS", ZADANA_POSLOVNICA.address),
    code: v("DIMARIS_STORE_CODE", ZADANA_POSLOVNICA.code),
    brojPohrane: v("DIMARIS_STORAGE_NUMBER", ZADANA_POSLOVNICA.brojPohrane),
  };
}

// CSV po Pravilniku o načinu objave cjenika (NN 132/2026): UTF-8, točka-zarez,
// decimalna točka, 11 stupaca ovim redom (isto zaglavlje kao diMaris).
export const CSV_SEPARATOR = ";";

export const CSV_HEADER = [
  "naziv",
  "sifra",
  "marka",
  "neto_kolicina",
  "jedinica_mjere",
  "maloprodajna_cijena",
  "posebni_oblik_prodaje",
  "cijena_za_jedinicu_mjere",
  "barkod",
  "ean_barkod",
  "bazna_cijena",
];

// Objave se čuvaju najmanje 30 dana; brišemo tek starije od 31 dan.
export const RETENTION_DAYS = 31;

// Ako je neispravno više od ovog udjela artikala, ne objavljujemo ništa
// (zadnji ispravni cjenik ostaje javan).
const MAX_UDIO_NEISPRAVNIH = 0.1;

const STANJE_KEY = "stanje.json";
const POKUSAJ_KEY = "zadnji-pokusaj.json";
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

// "20261113_0630" (za naziv datoteke, NN 132/2026 čl. 6.3: GGGGMMDD_SSMM, po Zagrebu)
export function zagrebStamp(date = new Date()) {
  const p = zagrebParts(date);
  return `${p.y}${p.m}${p.d}_${p.hh}${p.mm}`;
}

// ---------------------------------------------------------------------------
// Naziv datoteke (NN 132/2026, čl. 6.3), kao diMaris:
//   {OIB}_{VRSTA}_{adresa}_{oznaka}_ROBA_{broj-pohrane}_{GGGGMMDD}_{SSMM}.csv
//   npr. 02359254184_PRODAVAONICA_Grabi_54_23241_Policnik_T003_ROBA_000021_20261123_1200.csv
// Unutar dijela razmaci i nedopušteni znakovi postaju podvlaka, slova bez kvačica.

function ascii(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function dioNaziva(text) {
  return ascii(text)
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function nazivDatoteke({ broj, date, env = process.env }) {
  const p = poslovnica(env);
  const brojPohrane = p.brojPohrane || String(broj).padStart(6, "0");
  const dijelovi = [p.oib, p.vrsta.toUpperCase(), p.address, p.code, "ROBA", brojPohrane].map(dioNaziva);
  return `${dijelovi.join("_")}_${zagrebStamp(date)}.csv`;
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

function broj(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function cijena(n) {
  return n === null ? "" : n.toFixed(2);
}

// VENIO šifre jedinica -> oznaka u CSV-u (velika slova, kao diMaris).
const JEDINICE = {
  kg: "KG",
  kgr: "KG",
  l: "L",
  lit: "L",
  ltr: "L",
  kom: "KOM",
  ko: "KOM",
  kos: "KOM",
  pce: "KOM",
  kut: "KUT",
  pak: "PAK",
};

function jedinica(code) {
  const key = String(code ?? "").trim().toLowerCase().replace(/\.$/, "");
  return JEDINICE[key] || key.toUpperCase();
}

function kolicina(n) {
  return n === null ? "" : n.toFixed(3);
}

// Ispravan EAN-13 (kontrolna znamenka) izvan internog raspona 20 do 29 ide u
// stupac ean_barkod; interni (20 do 29) i neispravni ostaju u stupcu barkod.
function jeEan13(kod) {
  if (!/^\d{13}$/.test(kod)) return false;
  const z = [...kod].map(Number);
  const zbroj = z.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0);
  return (10 - (zbroj % 10)) % 10 === z[12];
}

export function podijeliBarkod(kod) {
  const k = String(kod ?? "").trim();
  if (!k) return { barkod: "", ean_barkod: "" };
  const interni = /^2\d/.test(k);
  return jeEan13(k) && !interni ? { barkod: "", ean_barkod: k } : { barkod: k, ean_barkod: "" };
}

// Pronađi stavke grupe u kojoj je skladište T003.
export function stavkeZaPoslovnicu(json, sifraSkladista = VENIO_SKLADISTE) {
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
  const jmVenio = jedinica(pick(stavka, "JedinicaMjereSifra", "JedinicaMjere"));
  const redovna = broj(pick(stavka, "Cijena"));
  const akcijska = broj(pick(stavka, "AkcijskaCijena"));
  const akcija = akcijska !== null && akcijska > 0;
  const bazna = broj(pick(stavka, "SidrenaCijena"));
  const brandSirovo = String(pick(stavka, "Brand") ?? "").trim();
  // VENIO za artikle bez marke šalje "NIJE RELEVANTNO"; to nije marka.
  const brand = /^nije relevantno$/i.test(brandSirovo) ? "" : brandSirovo;
  // VENIO ponekad šalje gotovu cijenu za jedinicu mjere (postavlja se ručno u ERP-u).
  const venioCijenaJm = broj(pick(stavka, "CijenaPoJediniciMjere"));
  // Količina osnovne jedinice (kg ili l) u jednoj prodajnoj jedinici: 1 za robu na
  // kg/l, 0.14 za staklenku od 140 g, 0.75 za bocu od 0,75 l. Nema je ako nije upisana.
  const tezinaSirovo = broj(pick(stavka, "TezinaPoOsnovnojJM"));
  const tezina = tezinaSirovo !== null && tezinaSirovo > 0 ? tezinaSirovo : null;

  // VENIO šalje akcijsku cijenu po osnovnoj jedinici (kg ili l), a redovnu po prodajnoj
  // jedinici (npr. 13013 staklenka 140 g: redovna 5.76, akcijska 32.50 = €/kg).
  // Za pakiranu robu cijena komada na akciji je zato akcijska × težina (32.50 × 0.14 = 4.55).
  const pakirano = tezina !== null && tezina !== 1;
  const mpc = akcija ? (pakirano ? Math.round(akcijska * tezina * 100) / 100 : akcijska) : redovna;

  const greske = [];
  if (!sifra) greske.push("nema šifre");
  if (!naziv) greske.push("nema naziva");
  if (mpc === null || mpc <= 0) greske.push("nema cijene");

  // Roba na vagu (kg ili l, cijena već po jedinici): neto količina prazna, cijena za JM = MPC.
  // Pakirano (komad, pakiranje, boca): neto količina iz VENIO-a, cijena za JM = MPC / neto.
  // Kao diMaris: za pakiranu robu jedinica mjere je osnovna (KG), za vino L.
  const naVagu = (jmVenio === "KG" || jmVenio === "L") && (tezina === null || tezina === 1);
  let jm = jmVenio;
  let neto = null;
  let cijenaJm = null;
  if (naVagu) {
    cijenaJm = mpc;
  } else if (tezina !== null) {
    jm = jmVenio === "L" ? "L" : "KG";
    neto = tezina;
    cijenaJm = akcija ? akcijska : mpc !== null ? mpc / tezina : null;
  }
  if (venioCijenaJm !== null && venioCijenaJm > 0) cijenaJm = venioCijenaJm;

  if (cijenaJm === null) upozorenja.push("cijena_za_jedinicu_mjere");
  if (bazna === null) upozorenja.push("bazna_cijena");
  if (!jm) upozorenja.push("jedinica_mjere");
  if (!brand) upozorenja.push("marka");

  // Marka se ne izmišlja: ako je VENIO ne pošalje, ostaje prazna.
  const red = {
    naziv,
    sifra,
    marka: brand,
    neto_kolicina: kolicina(neto),
    jedinica_mjere: jm,
    maloprodajna_cijena: cijena(mpc),
    posebni_oblik_prodaje: akcija ? "DA" : "NE",
    cijena_za_jedinicu_mjere: cijena(cijenaJm),
    ...podijeliBarkod(pick(stavka, "ArtiklBarkod")),
    bazna_cijena: cijena(bazna),
  };

  return { red, greske, upozorenja };
}

// Cijeli VENIO odgovor -> { redovi, izvjestaj }. Baca grešku ako se ne smije objaviti.
export function pripremiCjenik(json) {
  const stavke = stavkeZaPoslovnicu(json);
  if (stavke.length === 0) {
    throw new Error("VENIO je vratio prazan cjenik.");
  }
  const redovi = [];
  const neispravni = [];
  const upozorenja = {};
  for (const stavka of stavke) {
    const { red, greske, upozorenja: u } = mapirajStavku(stavka);
    if (greske.length > 0) {
      neispravni.push({ sifra: red.sifra, greske });
      continue;
    }
    for (const polje of u) upozorenja[polje] = (upozorenja[polje] || 0) + 1;
    redovi.push(red);
  }

  if (redovi.length === 0 || neispravni.length / stavke.length > MAX_UDIO_NEISPRAVNIH) {
    const primjeri = neispravni.slice(0, 5).map((n) => `${n.sifra || "?"}: ${n.greske.join(", ")}`);
    throw new Error(`Previše neispravnih artikala (${neispravni.length} od ${stavke.length}). ${primjeri.join("; ")}`);
  }

  redovi.sort((a, b) => a.naziv.localeCompare(b.naziv, "hr"));

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
export async function sinkroniziraj({ store, dohvatiJson, now = new Date(), env = process.env }) {
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
    filename: nazivDatoteke({ broj, date: now, env }),
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

export async function popis(store, env = process.env) {
  const stanje = await ucitajStanje(store);
  const objave = [...stanje.objave].reverse().map(javnaObjava);
  const { name, vrsta, address, code } = poslovnica(env);
  return {
    poslovnica: { name, vrsta, address, code },
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

// ---------------------------------------------------------------------------
// Praćenje: je li današnji cjenik objavljen (Notion: upozorenje ako ga nema do 8:00).

// Zapis zadnjeg pokušaja sinkronizacije (uspjeh ili greška), bez pristupnih podataka.
export async function zapisiPokusaj(store, { ok, poruka, now = new Date() }) {
  await store.setJSON(POKUSAJ_KEY, { ok, poruka: String(poruka || "").slice(0, 300), vrijeme: now.toISOString() });
}

export const ROK_SAT = 8;

export async function stanjeDanas(store, now = new Date()) {
  const stanje = await ucitajStanje(store);
  const zadnja = stanje.objave[stanje.objave.length - 1] || null;
  const pokusaj = await store.get(POKUSAJ_KEY, { type: "json" });
  const danas = zagrebDatum(now);
  // Objava "danas" = objava s današnjim datumom cjenika ili objavljena danas po Zagrebu.
  const objavljenoDanas = Boolean(zadnja && (zadnja.datum === danas || zagrebDatum(new Date(zadnja.publishedAt)) === danas));
  const prijeRoka = Number(zagrebParts(now).hh) < ROK_SAT;
  return {
    ok: objavljenoDanas || prijeRoka,
    objavljenoDanas,
    danas,
    rok: `${String(ROK_SAT).padStart(2, "0")}:00`,
    zadnjaObjava: zadnja ? { filename: zadnja.filename, publishedAt: zadnja.publishedAt, artikala: zadnja.artikala } : null,
    zadnjiPokusaj: pokusaj || null,
  };
}
