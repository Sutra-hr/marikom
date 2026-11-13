// Javna stranica s cjenicima (Odluka o objavi cjenika, NN 101/26).
// Slaže se na poslužitelju kao običan HTML s poveznicama na CSV datoteke,
// tako da je i robotima koji ne pokreću JavaScript sve vidljivo i dohvatljivo.
// Na stranicu ne vodi nijedna poveznica s weba (dogovor: cjenik nije za posjetitelje).
import { getStore } from "@netlify/blobs";
import { STORE_NAME, popis } from "../lib/cjenik.mjs";

export const config = {
  method: ["GET", "HEAD"],
  path: "/objava-cjenika",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

// ISO (UTC) -> "13. 11. 2026. u 06:30" po Zagrebu
function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zagreb",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return `${p.day}. ${p.month}. ${p.year}. u ${p.hour}:${p.minute}`;
}

export function renderPage({ poslovnica, latest, archive }, generatedAt = new Date()) {
  const latestHtml = latest
    ? `<p>Aktualni cjenik: <a href="/cjenici/aktualni.csv" download="${escapeHtml(latest.filename)}">/cjenici/aktualni.csv</a>
        <br><small>Datoteka: ${escapeHtml(latest.filename)} · objava: ${escapeHtml(formatDateTime(latest.publishedAt))}</small></p>`
    : `<p>Cjenik još nije objavljen.</p>`;

  const archiveHtml = archive.length
    ? `<details>
        <summary>Arhiva cjenika, zadnjih 30 dana (${archive.length})</summary>
        <ul>
          ${archive
            .map(
              (entry) =>
                `<li><a href="${escapeHtml(entry.url)}" download>${escapeHtml(entry.filename)}</a> <small>(${escapeHtml(
                  formatDateTime(entry.publishedAt)
                )})</small></li>`
            )
            .join("\n          ")}
        </ul>
      </details>`
    : "";

  return `<!doctype html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Objava cjenika | Marikomerc</title>
  <meta name="description" content="Dnevni cjenik Marikomerc maloprodaje u CSV formatu, s arhivom zadnjih 30 dana.">
  <link rel="canonical" href="https://www.marikomerc.hr/objava-cjenika">
  <link rel="alternate" type="application/json" href="/cjenici/popis.json" title="Popis cjenika (JSON)">
  <style>
    :root { color-scheme: light; }
    body { margin: 0; background: #fff; color: #1c2640; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    main { max-width: 860px; margin: 0 auto; padding: 32px 16px 64px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin: 0 0 4px; font-size: 20px; }
    a { color: #2a6db0; word-break: break-all; }
    section { border-top: 1px solid #dfe3ea; padding: 20px 0; }
    .meta, small { color: #5b6478; }
    ul { padding-left: 20px; }
    li { margin: 4px 0; }
    summary { cursor: pointer; }
    footer { margin-top: 24px; color: #5b6478; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <p><a href="/">← marikomerc.hr</a></p>
    <h1>Objava cjenika</h1>
    <p>Cjenik se objavljuje svaki dan u CSV formatu, u skladu s Odlukom o objavi cjenika proizvoda i usluga (NN 101/26). Prethodni cjenici dostupni su u arhivi 30 dana.</p>
    <p>Popis svih cjenika za strojnu obradu: <a href="/cjenici/popis.json">/cjenici/popis.json</a> (JSON).</p>
    <section id="${escapeHtml(poslovnica.code)}">
      <h2>${escapeHtml(poslovnica.name)}</h2>
      <p class="meta">${escapeHtml(poslovnica.address)} · oznaka prodajnog objekta: ${escapeHtml(poslovnica.code)}</p>
      ${latestHtml}
      ${archiveHtml}
    </section>
    <footer>Stranica generirana: ${escapeHtml(generatedAt.toISOString())}</footer>
  </main>
</body>
</html>`;
}

export default async function handler(request) {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const html = renderPage(await popis(store));
    return new Response(request.method === "HEAD" ? null : html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, max-age=120, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error(JSON.stringify({ message: "Marikomerc cjenik: stranica objave nije uspjela.", error: String(error?.message || error) }));
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Objava cjenika</title><p>Popis cjenika trenutno nije dostupan. Pokušajte ponovno za nekoliko minuta.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }
}
