// Zajedničko za jutarnje i ručno pokretanje.
import { getStore } from "@netlify/blobs";
import { STORE_NAME, sinkroniziraj, zapisiPokusaj } from "./cjenik.mjs";
import { dohvatiVenioCjenik } from "./venio.mjs";

export async function pokreni() {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  try {
    const rezultat = await sinkroniziraj({ store, dohvatiJson: (datum) => dohvatiVenioCjenik(datum) });
    console.log(
      JSON.stringify({
        message: "Marikomerc cjenik: sinkronizacija gotova.",
        objavljeno: rezultat.objavljeno,
        razlog: rezultat.razlog,
        objava: rezultat.objava?.filename,
        obrisano: rezultat.obrisano,
        izvjestaj: { ...rezultat.izvjestaj, neispravni: rezultat.izvjestaj.neispravni.slice(0, 20) },
      })
    );
    await zapisiPokusaj(store, {
      ok: true,
      poruka: rezultat.objavljeno ? `objavljeno: ${rezultat.objava.filename}` : rezultat.razlog,
    }).catch(() => {});
    return { ok: true, ...rezultat };
  } catch (error) {
    // Zadnji ispravni cjenik ostaje javan. Poruka ne sadrži pristupne podatke.
    console.error(JSON.stringify({ message: "Marikomerc cjenik: sinkronizacija NIJE uspjela.", error: String(error?.message || error) }));
    await zapisiPokusaj(store, { ok: false, poruka: String(error?.message || error) }).catch(() => {});
    return { ok: false, error: String(error?.message || error) };
  }
}
