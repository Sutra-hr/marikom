// Praćenje objave cjenika (za vanjski nadzor, npr. UptimeRobot):
//   GET /cjenici/stanje.json
//   200 = današnji cjenik je objavljen, ili je još prije 8:00 po Zagrebu
//   503 = prošlo je 8:00, a današnji cjenik nije objavljen (poslati upozorenje)
// U tijelu je i zadnji pokušaj sinkronizacije (npr. poruka greške VENIO-a), bez pristupnih podataka.
import { getStore } from "@netlify/blobs";
import { STORE_NAME, stanjeDanas } from "../lib/cjenik.mjs";

export const config = {
  method: ["GET", "HEAD"],
  path: "/cjenici/stanje.json",
};

export default async function handler() {
  try {
    const stanje = await stanjeDanas(getStore({ name: STORE_NAME, consistency: "strong" }));
    return Response.json(stanje, { status: stanje.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ message: "Marikomerc cjenik: stanje nije dostupno.", error: String(error?.message || error) }));
    return Response.json({ ok: false, error: "Pohrana nije dostupna." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
