import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router.js";
import {
  WrapAll,
  BlueLine,
  Naslov,
  Uvod,
  Info,
  InfoText,
  Controls,
  DownloadButton,
  TableWrap,
  Table,
  Napomena,
  Poruka,
  Filteri,
  Checkbox,
  Broj,
  Kartice,
  Kartica,
  Oznaka,
  Loader,
  Kostur,
} from "./style.js";

const TEXT = {
  hr: {
    naslov: "CJENIK",
    uvod: "Dnevni cjenik maloprodaje Marikomerc Poličnik sa sidrenim cijenama. Cjenik se ažurira svaki dan prije 8 sati, a arhiva sadrži objave iz zadnjih 30 dana.",
    ucitavanje: "Učitavanje cjenika…",
    greska: "Cjenik trenutno nije dostupan. Pokušajte ponovno kasnije.",
    nemaCjenika: "Cjenik još nije objavljen.",
    aktualni: "Aktualni cjenik",
    arhivski: "Cjenik iz arhive",
    objavljeno: "Objavljeno",
    arhiva: "Arhiva (zadnjih 30 dana)",
    pretraga: "Pretraži proizvod",
    preuzmi: "Preuzmi CSV",
    nemaRezultata: "Nema proizvoda koji odgovaraju pretrazi.",
    napomena: "Cijene su izražene u eurima (€). Preuzeti CSV sadrži sve proizvode, uključujući nedostupne.",
    samoDostupni: "Prikaži samo dostupne proizvode",
    prikazano: (n, ukupno) => `Prikazano ${n} od ${ukupno} proizvoda`,
    akcija: "Akcija",
    sidrenaNa: "na dan",
    stupci: {
      sifra: "Šifra",
      naziv: "Naziv",
      marka: "Marka",
      jedinica: "Jed. mjere",
      cijenaJm: "Cijena za jed. mjere",
      mpc: "Maloprodajna cijena",
      akcija: "Posebni oblik prodaje",
      sidrena: "Sidrena cijena",
      dostupnost: "Dostupnost",
    },
    dostupno: { DOSTUPNO: "Dostupno", NEDOSTUPNO: "Nedostupno" },
    u: "u",
  },
  en: {
    naslov: "PRICE LIST",
    uvod: "Daily retail price list for Marikomerc Poličnik, including anchor prices. Updated every day before 8 a.m.; the archive contains the last 30 days.",
    ucitavanje: "Loading price list…",
    greska: "The price list is currently unavailable. Please try again later.",
    nemaCjenika: "The price list has not been published yet.",
    aktualni: "Current price list",
    arhivski: "Archived price list",
    objavljeno: "Published",
    arhiva: "Archive (last 30 days)",
    pretraga: "Search products",
    preuzmi: "Download CSV",
    nemaRezultata: "No products match your search.",
    napomena: "Prices are in euro (€). The downloaded CSV contains all products, including unavailable ones.",
    samoDostupni: "Show available products only",
    prikazano: (n, ukupno) => `Showing ${n} of ${ukupno} products`,
    akcija: "Offer",
    sidrenaNa: "as of",
    stupci: {
      sifra: "Code",
      naziv: "Name",
      marka: "Brand",
      jedinica: "Unit",
      cijenaJm: "Price per unit",
      mpc: "Retail price",
      akcija: "Special offer",
      sidrena: "Anchor price",
      dostupnost: "Availability",
    },
    dostupno: { DOSTUPNO: "Available", NEDOSTUPNO: "Unavailable" },
    u: "at",
  },
};

// CSV sa separatorom ";" (navodnici po potrebi).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = String(text || "").replace(/^﻿/, "");

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ";") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);

  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""]))
  );
}

const numberLocale = (locale) => (locale === "en" ? "en-GB" : "hr-HR");

function formatPrice(value, locale) {
  const number = Number(String(value).replace(",", "."));
  if (!String(value).trim() || !Number.isFinite(number)) return "";
  return `${number.toLocaleString(numberLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function formatDate(isoDate, locale) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate || "");
  if (!match) return isoDate || "";
  const [, y, m, d] = match;
  return locale === "en" ? `${Number(d)}/${Number(m)}/${y}` : `${Number(d)}. ${Number(m)}. ${y}.`;
}

function formatDateTime(iso, locale, t) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dateText = new Intl.DateTimeFormat(numberLocale(locale), {
    timeZone: "Europe/Zagreb",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Zagreb",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${dateText} ${t.u} ${timeText}`;
}

function Cjenik() {
  const { locale } = useRouter();
  const t = locale === "en" ? TEXT.en : TEXT.hr;

  const [index, setIndex] = useState(null);
  const [indexError, setIndexError] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [rows, setRows] = useState(null);
  const [rowsError, setRowsError] = useState(false);
  const [query, setQuery] = useState("");
  const [samoDostupni, setSamoDostupni] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/cjenici/popis.json")
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setIndexError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const poslovnica = index?.poslovnica;
  const archive = index?.archive || [];
  const latest = index?.latest || null;
  const selected = archive.find((entry) => entry.url === selectedUrl) || latest;
  const isLatest = Boolean(selected && latest && selected.filename === latest.filename);

  useEffect(() => {
    if (!selected) {
      setRows(null);
      return undefined;
    }
    let cancelled = false;
    setRows(null);
    setRowsError(false);
    fetch(selected.url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then((text) => {
        if (!cancelled) setRows(parseCsv(text));
      })
      .catch(() => {
        if (!cancelled) setRowsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.url]);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const needle = query.trim().toLocaleLowerCase("hr");
    return rows.filter(
      (row) =>
        (!samoDostupni || row.dostupnost !== "NEDOSTUPNO") &&
        (!needle ||
          [row.naziv_artikla, row.marka, row.sifra_artikla, row.barkod]
            .join(" ")
            .toLocaleLowerCase("hr")
            .includes(needle))
    );
  }, [rows, query, samoDostupni]);

  const sidrena = (row) =>
    formatPrice(row.sidrena_cijena, locale) ? (
      <>
        {formatPrice(row.sidrena_cijena, locale)}
        {row.datum_sidrene_cijene && (
          <small>
            {t.sidrenaNa} {formatDate(row.datum_sidrene_cijene, locale)}
          </small>
        )}
      </>
    ) : (
      ""
    );

  return (
    <WrapAll id="cjenik">
      <BlueLine />
      <Naslov>{t.naslov}</Naslov>
      <Uvod>{t.uvod}</Uvod>

      {indexError && <Poruka>{t.greska}</Poruka>}
      {!indexError && !index && (
        <Loader role="status" aria-live="polite">
          {t.ucitavanje}
        </Loader>
      )}

      {index && !selected && <Poruka>{t.nemaCjenika}</Poruka>}

      {index && selected && (
        <>
          <Info>
            <InfoText>
              <strong>{isLatest ? t.aktualni : t.arhivski}</strong>
              {" · "}
              {poslovnica?.name}, {poslovnica?.address}
              <br />
              {t.objavljeno}: {formatDateTime(selected.publishedAt, locale, t)}
            </InfoText>
            <Controls>
              <label>
                {t.arhiva}
                <select value={selected.url} onChange={(event) => setSelectedUrl(event.target.value)}>
                  {archive.map((entry) => (
                    <option key={entry.url} value={entry.url}>
                      {formatDate(entry.datum, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.pretraga}
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <DownloadButton href={selected.url} download={selected.filename}>
                {t.preuzmi}
              </DownloadButton>
            </Controls>
          </Info>

          {rowsError && <Poruka>{t.greska}</Poruka>}
          {!rowsError && !rows && (
            <>
              <Loader role="status" aria-live="polite">
                {t.ucitavanje}
              </Loader>
              <Kostur aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} />
                ))}
              </Kostur>
            </>
          )}
          {!rowsError && rows && (
            <>
              <Filteri>
                <Checkbox>
                  <input
                    type="checkbox"
                    checked={samoDostupni}
                    onChange={(event) => setSamoDostupni(event.target.checked)}
                  />
                  {t.samoDostupni}
                </Checkbox>
                <Broj aria-live="polite">{t.prikazano(filteredRows.length, rows.length)}</Broj>
              </Filteri>
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>{t.stupci.sifra}</th>
                      <th>{t.stupci.naziv}</th>
                      <th>{t.stupci.marka}</th>
                      <th>{t.stupci.jedinica}</th>
                      <th className="num">{t.stupci.cijenaJm}</th>
                      <th className="num">{t.stupci.mpc}</th>
                      <th>{t.stupci.akcija}</th>
                      <th className="num">{t.stupci.sidrena}</th>
                      <th>{t.stupci.dostupnost}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={`${row.sifra_artikla}-${i}`}>
                        <td>{row.sifra_artikla}</td>
                        <td>{row.naziv_artikla}</td>
                        <td>{row.marka}</td>
                        <td>{row.jedinica_mjere}</td>
                        <td className="num">{formatPrice(row.cijena_za_jedinicu_mjere, locale)}</td>
                        <td className="num">{formatPrice(row.maloprodajna_cijena, locale)}</td>
                        <td>
                          {row.poseban_oblik_prodaje === "DA" && (
                            <Oznaka $akcija>{row.naziv_posebnog_oblika_prodaje || t.akcija}</Oznaka>
                          )}
                        </td>
                        <td className="num sidrena">{sidrena(row)}</td>
                        <td>
                          <Oznaka $nedostupno={row.dostupnost === "NEDOSTUPNO"}>
                            {t.dostupno[row.dostupnost] || row.dostupnost}
                          </Oznaka>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {filteredRows.length === 0 && <Poruka>{t.nemaRezultata}</Poruka>}
              </TableWrap>
              <Kartice>
                {filteredRows.map((row, i) => {
                  const akcija = row.poseban_oblik_prodaje === "DA";
                  const cijenaJm = formatPrice(row.cijena_za_jedinicu_mjere, locale);
                  return (
                    <Kartica key={`${row.sifra_artikla}-${i}`} $nedostupno={row.dostupnost === "NEDOSTUPNO"}>
                      <div className="vrh">
                        <div>
                          <div className="naziv">{row.naziv_artikla}</div>
                          <div className="marka">
                            {row.marka} · {row.sifra_artikla}
                          </div>
                        </div>
                        <div className="sidrena">
                          <span>{t.stupci.sidrena}</span>
                          {formatPrice(row.sidrena_cijena, locale)}
                        </div>
                      </div>
                      <dl>
                        <div>
                          <dt>{t.stupci.mpc}</dt>
                          <dd>
                            {formatPrice(row.maloprodajna_cijena, locale)} / {row.jedinica_mjere}
                          </dd>
                        </div>
                        {cijenaJm && (
                          <div>
                            <dt>{t.stupci.cijenaJm}</dt>
                            <dd>
                              {cijenaJm} / {row.jedinica_mjere}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="oznake">
                        {akcija && <Oznaka $akcija>{row.naziv_posebnog_oblika_prodaje || t.akcija}</Oznaka>}
                        <Oznaka $nedostupno={row.dostupnost === "NEDOSTUPNO"}>
                          {t.dostupno[row.dostupnost] || row.dostupnost}
                        </Oznaka>
                      </div>
                    </Kartica>
                  );
                })}
                {filteredRows.length === 0 && <Poruka>{t.nemaRezultata}</Poruka>}
              </Kartice>
              <Napomena>{t.napomena}</Napomena>
            </>
          )}
        </>
      )}
    </WrapAll>
  );
}

export default Cjenik;
