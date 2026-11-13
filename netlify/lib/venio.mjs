// Poziv VENIO API-ja (samo sa servera; pristupni podaci su Netlify env varijable).
// Nazivi varijabli su doslovno iz Notion upute:
//
// VENIO_API_BASE_URL   npr. http://185.168.118.6:54777  (bez završnog /)
// VENIO_API_USERNAME   Basic Auth korisnik
// VENIO_API_PASSWORD   Basic Auth lozinka
// VENIO_API_ALLOW_HTTP=1  samo ako je svjesno dogovoreno slanje preko http://
//                         (VENIO trenutno nema HTTPS)

import { VENIO_SKLADISTE } from "./cjenik.mjs";

const TIMEOUT_MS = 60_000;

export function venioPostavke(env = process.env) {
  const baseUrl = String(env.VENIO_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const korisnik = String(env.VENIO_API_USERNAME || "");
  const lozinka = String(env.VENIO_API_PASSWORD || "");

  if (!baseUrl || !korisnik || !lozinka) {
    throw new Error("VENIO nije postavljen (VENIO_API_BASE_URL, VENIO_API_USERNAME, VENIO_API_PASSWORD).");
  }
  if (!baseUrl.startsWith("https://") && env.VENIO_API_ALLOW_HTTP !== "1") {
    throw new Error("VENIO adresa nije https://; lozinka se ne šalje nezaštićeno.");
  }
  return { baseUrl, korisnik, lozinka };
}

export function venioUrl(baseUrl, datum, sifraSkladista = VENIO_SKLADISTE) {
  return (
    `${baseUrl}/MaloprodajaCjenik/CjenikWebNovo/Skladiste/${encodeURIComponent(sifraSkladista)}/${datum}` +
    // sifraSkladistaZaDostupnost=V001: uputa VENIO-a (mail 13. 11. 2026.).
    // grupaArtiklId=21&grupaNaziv=Brand: Notion uputa; bez toga VENIO ne šalje polje "Brand".
    `?sifraSkladistaZaDostupnost=V001&grupaArtiklId=21&grupaNaziv=Brand`
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
    // Dokumentacija v1.4 (8.): kod 400 zabilježiti tijelo odgovora (kratko, bez pristupnih podataka).
    const poruka = (await response.text().catch(() => "")).slice(0, 200).replace(/\s+/g, " ").trim();
    throw new Error(`VENIO je vratio HTTP ${response.status}.${poruka ? ` ${poruka}` : ""}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`VENIO odgovor nije JSON (${text.slice(0, 80).replace(/\s+/g, " ")}…).`);
  }
}
