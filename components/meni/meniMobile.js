// import { Link } from "gatsby"
import Link from "next/link";
import React, { useEffect, useState } from "react";
// import Button from "../button/button.js";
// import { useHistory } from "react-router-dom"
import {
  WrapLeftBlock,
  WrapRightBlock,
  WrapBlock,
  BottomBlock,
  BottomBlockTop,
  SwitcherWrap,
  Title,
} from "./style.js";
// import scrollTo from "gatsby-plugin-smoothscroll"
// import { AnchorLink } from "gatsby-plugin-anchor-links"
// import { HashLink } from "react-router-hash-link";

import LanguageSwitcher from "../language switcher/index.js";
import { useRouter } from "next/router.js";
import useScrollBlock from "../helper/useScrollBlock.js";

const MeniMobile = ({
  isOpen,
  setIsOpen,
  closeMenu,
  novostiNaslovi,
  oglasiNaslovi,
}) => {
  const [isOnamaMenuOpen, setIsOnamaMenuOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const { locale } = useRouter();
  // const [blockScroll, allowScroll] = useScrollBlock();

  // const history = useHistory()
  // const goToHome = () => {
  //   // console.log("klikni")
  //   // let path = `/`
  //   // history.push(path)
  // }
  useEffect(() => {
    if (isOpen === false) {
      setIsOnamaMenuOpen(false);
      setIsGroupMenuOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      <div className={`menu ${isOpen ? "openMenu" : "closedMenu"}`}>
        <WrapBlock>
          <Link className="mobileLinks" href="/proizvodi">
            {locale === "hr" ? "Proizvodi" : "Products"}
          </Link>
          <Link href="/horeca">
            {locale === "hr" ? "HoReCa suradnja" : "HoReCa collaboration"}
          </Link>
          <Link href="/karijere">
            {locale === "hr" ? "Karijere" : "Careers"}
          </Link>
          <Link href="/kontakt">{locale === "hr" ? "Kontakt" : "Contact"}</Link>
          <Link href="/novosti">{locale === "hr" ? "Novosti" : "News"}</Link>
          <SwitcherWrap>
            <LanguageSwitcher
              closeMenu={closeMenu}
              novostiNaslovi={novostiNaslovi}
              oglasiNaslovi={oglasiNaslovi}
            />
          </SwitcherWrap>
        </WrapBlock>
        <BottomBlock
          className={`bottomMenu ${
            isOpen ? "openBottomMenu" : "closedBottomMenu"
          }`}
        >
          <BottomBlockTop>
            <WrapLeftBlock>
              <Title>{locale === "hr" ? "O NAMA" : "ABOUT US"}</Title>{" "}
              <Link href="/o-nama">
                {locale === "hr" ? "Naša priča" : "Our story"}
              </Link>
              <Link href="/marikomerc-kvalitete">
                {locale === "hr"
                  ? "Marikomerc kvalitete"
                  : "Marikomerc qualities"}
              </Link>
              <Link href="/prerada-i-skladiste">
                {locale === "hr"
                  ? "Prerada i skladište"
                  : "Processing and Storage"}
              </Link>
            </WrapLeftBlock>
            <WrapRightBlock>
              <Title>{locale === "hr" ? "GRUPA" : "GROUP"}</Title>{" "}
              <Link className="navLinkDrop" href="/MLS">
                {locale === "hr" ? "MLS Logistika" : "MLS Logistics"}
              </Link>
              <Link className="navLinkDrop" href="https://dimaris.hr/">
                {locale === "hr"
                  ? "DI Maris - Ribarnice"
                  : "DI Maris - Fish market"}
              </Link>
              <Link className="navLinkDrop" href="https://perlabisermora.hr/">
                {locale === "hr" ? "Perla - Biser Mora" : "Perla - Sea Pearl"}
              </Link>
            </WrapRightBlock>
          </BottomBlockTop>
          {/* <div className="mobileLinkDivider"></div> */}
          {/* <SwitcherWrap>
            <LanguageSwitcher
              closeMenu={closeMenu}
              novostiNaslovi={novostiNaslovi}
              oglasiNaslovi={oglasiNaslovi}
            />
          </SwitcherWrap> */}
        </BottomBlock>
        <div>
          <div
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeniMobile;
