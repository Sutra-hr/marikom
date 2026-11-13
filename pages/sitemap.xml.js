import React from "react";

const Sitemap = () => {};

export const getServerSideProps = async ({ res }) => {
  const baseUrl = "https://www.marikomerc.hr";

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
