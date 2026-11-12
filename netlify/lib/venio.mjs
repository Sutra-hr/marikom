// Poziv VENIO API-ja (samo sa servera; pristupni podaci su Netlify env varijable).
//
// MARIKOMERC_VENIO_URL       npr. https://<host>:<port>  (bez završnog /)
// MARIKOMERC_VENIO_KORISNIK  Basic Auth korisnik
// MARIKOMERC_VENIO_LOZINKA   Basic Auth lozinka
// MARIKOMERC_VENIO_DOZVOLI_HTTP=1  samo ako je svjesno dogovoreno slanje preko http://

import { POSLOVNICA } from "./cjenik.mjs";

const TIMEOUT_MS = 60_000;

export function venioPostavke(env = process.env) {
  const baseUrl = String(env.MARIKOMERC_VENIO_URL || "").trim().replace(/\/+$/, "");
  const korisnik = String(env.MARIKOMERC_VENIO_KORISNIK || "");
  const lozinka = String(env.MARIKOMERC_VENIO_LOZINKA || "");

  if (!baseUrl || !korisnik || !lozinka) {
    throw new Error("VENIO nije postavljen (MARIKOMERC_VENIO_URL, _KORISNIK, _LOZINKA).");
  }
  if (!baseUrl.startsWith("https://") && env.MARIKOMERC_VENIO_DOZVOLI_HTTP !== "1") {
    throw new Error("VENIO adresa nije https://; lozinka se ne šalje nezaštićeno.");
  }
  return { baseUrl, korisnik, lozinka };
}

export function venioUrl(baseUrl, datum, sifraSkladista = POSLOVNICA.code) {
  return (
    `${baseUrl}/MaloprodajaCjenik/CjenikWebNovo/Skladiste/${encodeURIComponent(sifraSkladista)}/${datum}` +
    `?grupaArtiklId=21&grupaNaziv=Brand`
  );
}

export async function dohvatiVenioCjenik(datum, env = process.env) {
  const { baseUrl, korisnik, lozinka } = venioPostavke(env);
  const auth = Buffer.from(`${korisnik}:${lozinka}`).toString("base64");

  let response;
  try {
    response = await fetch(venioUrl(baseUrl, datum), {
      headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(`VENIO nije dostupan: ${error?.name || "greška"} ${error?.message || ""}`.trim());
  }

  if (!response.ok) {
    throw new Error(`VENIO je vratio HTTP ${response.status}.`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`VENIO odgovor nije JSON (${text.slice(0, 80).replace(/\s+/g, " ")}…).`);
  }
}
