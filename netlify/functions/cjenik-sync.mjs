// Svako jutro dohvaća cjenik iz VENIO-a i objavljuje ga.
// Netlify raspored je u UTC: 05:00 i 05:30 UTC = 06:00 i 06:30 zimi, 07:00 i 07:30 ljeti
// (uvijek prije 8:00 po Zagrebu). Drugi pokušaj ne objavljuje ponovno ako je cjenik isti.
import { pokreni } from "../lib/pokreni.mjs";

export const config = {
  schedule: "0,30 5 * * *",
};

export default async function handler() {
  const rezultat = await pokreni();
  return Response.json(rezultat, { status: rezultat.ok ? 200 : 500 });
}
