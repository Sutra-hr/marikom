import React from "react";

const Sitemap = () => {};

export const getServerSideProps = async ({ res }) => {
  const baseUrl = "https://www.marikomerc.hr";
  // Cjenik (NN 101/26) se objavljuje svaki dan; stranica za robote nema poveznica sa weba,
  // pa je sitemap jedini put kojim je tražilice nađu.
  const danas = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   
      <url>
      <loc>https://www.marikomerc.hr</loc>
      <lastmod>2022-06-01</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
       <url>
      <loc>https://www.marikomerc.hr/en</loc>
      <lastmod>2022-06-01</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
     <url>
      <loc>https://www.marikomerc.hr/karijere</loc>
      <lastmod>2022-06-01</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
     <url>
      <loc>https://www.marikomerc.hr/en/karijere</loc>
      <lastmod>2022-06-01</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
    <loc>https://www.marikomerc.hr/novosti</loc>
    <lastmod>2022-10-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
   <url>
    <loc>https://www.marikomerc.hr/en/novosti</loc>
    <lastmod>2022-10-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://marikomerc.hr/objava-cjenika</loc>
    <lastmod>${danas}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://marikomerc.hr/cjenici/aktualni.csv</loc>
    <lastmod>${danas}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
