// Javne adrese cjenika (bez prijave):
//   /cjenici/aktualni.csv          zadnji objavljeni cjenik
//   /cjenici/arhiva/<naziv>.csv    svaka objava iz zadnjih 30+ dana
//   /cjenici/popis.json            popis objava za prikaz na stranici
import { getStore } from "@netlify/blobs";
import { STORE_NAME, popis, procitajAktualni, procitajArhivu } from "../lib/cjenik.mjs";

export const config = {
  method: ["GET", "HEAD"],
  path: ["/cjenici/aktualni.csv", "/cjenici/popis.json", "/cjenici/arhiva/*"],
};

const NOT_FOUND = () =>
  new Response("Not found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });

function csvResponse(request, { csv, filename }, cacheControl) {
  return new Response(request.method === "HEAD" ? null : csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default async function handler(request) {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const path = decodeURIComponent(new URL(request.url).pathname);

  try {
    if (path === "/cjenici/popis.json") {
      return Response.json(await popis(store), {
        headers: { "Cache-Control": "public, max-age=0, must-revalidate", "Netlify-CDN-Cache-Control": "public, max-age=120" },
      });
    }

    if (path === "/cjenici/aktualni.csv") {
      const result = await procitajAktualni(store);
      return result ? csvResponse(request, result, "public, max-age=0, must-revalidate") : NOT_FOUND();
    }

    const match = /^\/cjenici\/arhiva\/([A-Za-z0-9][A-Za-z0-9._+-]*\.csv)$/.exec(path);
    if (match) {
      const result = await procitajArhivu(store, match[1]);
      // Arhivska datoteka se nikad ne mijenja.
      return result ? csvResponse(request, result, "public, max-age=86400, immutable") : NOT_FOUND();
    }
  } catch (error) {
    console.error(JSON.stringify({ message: "Marikomerc cjenik: čitanje nije uspjelo.", error: String(error?.message || error) }));
    return new Response("Price list unavailable\n", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return NOT_FOUND();
}
