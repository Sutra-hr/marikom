// Svakih 15 minuta dohvaća cjenik iz VENIO-a (Notion uputa).
// - Prva uspješna provjera u danu (po Zagrebu) objavljuje cjenik za taj dan, dakle
//   daleko prije 8:00, ako VENIO tada odgovara.
// - Kasnije provjere istog dana objavljuju novu verziju (i arhivsku kopiju) samo ako
//   se sadržaj promijenio; isti sadržaj se preskače.
// - Greška nikad ne dira zadnji ispravni cjenik.
import { pokreni } from "../lib/pokreni.mjs";

export const config = {
  schedule: "*/15 * * * *",
};

export default async function handler() {
  const rezultat = await pokreni();
  return Response.json(rezultat, { status: rezultat.ok ? 200 : 500 });
}
