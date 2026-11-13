import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { Switcher } from "./style.js";
// import { Context } from "../../pages/index.js";
import { useRouter } from "next/router";
import AppContext from "../../components/AppContext.js";
import slugify from "slugify";

function LanguageSwitcher({
  novostiNaslovi,
  oglasiNaslovi,
  setMessage,
  closeMenu,
}) {
  const context = useContext(AppContext);
  const { locale, asPath } = useRouter();

  const router = useRouter();
  const lang = ["hr", "en"];

  const handleSelectLang = (e, lang) => {
    handleRouteChange(lang);
  };
  const chooseMessage = (message) => {
    setMessage(message);
  };
  // funkcija za promjenu jezika i trazenje url-a za istu stranicu na drugom jeziku. novostiNaslovi u propsima dolazi iz parent page Novosti
  function handleRouteChange(lang) {
    if (lang != locale) {
      const getSlug = window.location.pathname.split("/").pop();
      if (asPath === "/") {
        const homeRedirect = locale === "hr" ? "/en" : "/";
        return router.push(homeRedirect, undefined, { locale: lang });
      }
      if (asPath === "/proizvodi") {
        const homeRedirect = locale === "hr" ? "/en/proizvodi" : "/proizvodi";
        return router.push(homeRedirect, undefined, { locale: lang });
      }
      if (asPath === "/horeca") {
        const homeRedirect = locale === "hr" ? "/en/horeca" : "/horeca";
        return router.push(homeRedirect, undefined, { locale: lang });
      }
      if (asPath === "/novosti") {
        return router.push("/novosti", undefined, { locale: lang });
      }
      if (asPath === "/karijere") {
        return router.push("/karijere", undefined, { locale: lang });
      }
      if (asPath === "/o-nama") {
        return router.push("/o-nama", undefined, { locale: lang });
      }
      if (asPath === "/marikomerc-kvalitete") {
        return router.push("/marikomerc-kvalitete", undefined, {
          locale: lang,
        });
      }
      if (asPath === "/dimaris") {
        return router.push("/dimaris", undefined, {
          locale: lang,
        });
      }
      if (asPath === "/MLS") {
        return router.push("/MLS", undefined, {
          locale: lang,
        });
      }
      if (asPath === "/prerada-i-skladiste") {
        return router.push("/prerada-i-skladiste", undefined, { locale: lang });
      }
      if (asPath === "/kontakt") {
        return router.push("/kontakt", undefined, { locale: lang });
      }
      if (asPath.includes("/karijere/")) {
        const getTranslationRouteForNews = oglasiNaslovi.filter((naslov) =>
          locale === "en"
            ? slugify(
                naslov.node.title,

                {
                  locale: "eng",
                  strict: true,
                  lower: true,
                },
              ) +
                `-id-${naslov.node.id}` ===
              getSlug
            : slugify(
                naslov.node.title,

                { locale: "hrv", strict: true, lower: true },
              ) +
                `-id-${naslov.node.id}` ===
              getSlug,
        );

        const matchingUrl =
          locale === "hr"
            ? slugify(
                getTranslationRouteForNews[0].node.title,

                { locale: "eng", strict: true, lower: true },
              ) + `-id-${getTranslationRouteForNews[0].node.id}`
            : slugify(
                getTranslationRouteForNews[0].node.title,

                { locale: "hrv", strict: true, lower: true },
              ) + `-id-${getTranslationRouteForNews[0].node.id}`;
        return router.push(matchingUrl, undefined, { locale: lang });
      }

      if (asPath.includes("/novosti/")) {
        const getTranslationRouteForNews = novostiNaslovi.filter((naslov) =>
          locale === "en"
            ? slugify(
                naslov.node.novosti.naslovEng
                  .toLowerCase()
                  .split(" ")
                  .join("-"),
                {
                  locale: "eng",
                  strict: true,
                },
              ) +
                `-id-${naslov.node.id}` ===
              getSlug
            : slugify(
                naslov.node.novosti.naslov.toLowerCase().split(" ").join("-"),
                {
                  locale: "hrv",
                  strict: true,
                },
              ) +
                `-id-${naslov.node.id}` ===
              getSlug,
        );

        const matchingUrl =
          locale === "hr"
            ? slugify(
                getTranslationRouteForNews[0].node.novosti.naslovEng
                  .toLowerCase()
                  .split(" ")
                  .join("-"),
                { locale: "eng", strict: true },
              ) + `-id-${getTranslationRouteForNews[0].node.id}`
            : slugify(
                getTranslationRouteForNews[0].node.novosti.naslov
                  .toLowerCase()
                  .split(" ")
                  .join("-"),
                { locale: "hrv", strict: true },
              ) + `-id-${getTranslationRouteForNews[0].node.id}`;
        return router.push(matchingUrl, undefined, { locale: lang });
      }
      // pronađi za matchinUrl za Novosti
    }
  }
  return (
    <div className="languageSwitchWrap">
      <Switcher
        onClick={(e) => {
          handleSelectLang(e, "hr");
          closeMenu();
        }}
        className={locale === "hr" ? "activeLangLink" : ""}
      >
        HR
      </Switcher>
      <Switcher
        onClick={(e) => {
          handleSelectLang(e, "en");
          closeMenu();
        }}
        className={locale === "en" ? "activeLangLink" : ""}
      >
        EN
      </Switcher>
    </div>
  );
}

export default LanguageSwitcher;
