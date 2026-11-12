import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Cjenik from "../../components/CjenikPage/cjenik";

export default function CjenikPage() {
  const { locale } = useRouter();
  const isHR = locale !== "en";

  const title = isHR ? "Cjenik | Marikomerc" : "Price list | Marikomerc";
  const desc = isHR
    ? "Dnevni cjenik maloprodaje Marikomerc Poličnik (Grabi 54) sa sidrenim cijenama i arhivom zadnjih 30 dana."
    : "Daily retail price list for Marikomerc Poličnik (Grabi 54) with anchor prices and a 30-day archive.";

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} key="desc" />
        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={desc} />
        <link rel="canonical" href={isHR ? "https://marikomerc.hr/cjenik" : "https://marikomerc.hr/en/cjenik"} key="canonical" />
        <link rel="alternate" hrefLang="hr" href="https://marikomerc.hr/cjenik" />
        <link rel="alternate" hrefLang="en" href="https://marikomerc.hr/en/cjenik" />
      </Head>
      <Cjenik />
    </Layout>
  );
}
