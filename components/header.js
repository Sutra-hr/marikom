import Link from "next/link";
import React, { useState, useRef } from "react";
// import { Link } from "gatsby"
// import PropTypes from "prop-types"
// import Headroom from "react-headroom"
// import scrollTo from "gatsby-plugin-smoothscroll"
// import styled from "styled-components"
import { GiHamburgerMenu } from "react-icons/gi";
import ArrowDown from "../svg/arrowDown.svg";
import MeniMobile from "./meni/meniMobile";
import { Link as Veza } from "react-scroll";
// import scrollTo from "gatsby-plugin-smoothscroll"
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/router";
import LanguageSwitcher from "./language switcher";
import MarikomercLogo from "../svg/MarikomercGrupaWhite.svg";
// import HeroLogo from "../assets/images/herologo.png";
// import HeroLogo from "../assets/images/MClogo2023.svg";
import { useOnClickOutside } from "./helper/useClickOutside";
import useScrollBlock from "../components/helper/useScrollBlock";
import { useEffect } from "react";
import Headroom from "react-headroom";
const Header = ({ siteTitle, novostiNaslovi, oglasiNaslovi }) => {
  const ref = useRef();
  // State for our modal
  const [blockScroll, allowScroll] = useScrollBlock();

  // Call hook passing in the ref and a function to call on outside click
  // useOnClickOutside(ref, () => setIsOnamaOpen(false));

  const router = useRouter();
  const { locale } = router;

  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("Hello World");

  // const [isOnamaOpen, setIsOnamaOpen] = useState(false);

  function handleCloseMenu() {
    setIsOpen(false);
  }

  // useEffect(() => {
  //   isOpen == true ? blockScroll() : allowScroll();
  // }, [isOpen]);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) {
      html.style.overflow = isOpen ? "hidden" : "";
    }
  }, [isOpen]);

  // <Headroom
  //   style={{
  //     WebkitTransition: "all .5s ease-in-out",
  //     Transition: "all .5s ease-in-out",
  //     transition: "all .5s ease-in-out",
  //     zIndex: "999",
  //     height: "65px",
  //   }}
  // >
  return (
    <>
      {/* <Script src="https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15/dist/smooth-scroll.polyfills.min.js" /> */}
      <Headroom>
        <header>
          <MeniMobile
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            closeMenu={handleCloseMenu}
            novostiNaslovi={novostiNaslovi}
            oglasiNaslovi={oglasiNaslovi}
          />
          <div className="headerWrap">
            <div className="navBar">
              <Link href="/">
                <div className="navLink navTitle navLogo">
                  <Image src="/MClogo2023.svg" layout="fill" />
                </div>
              </Link>
              <div>
                <GiHamburgerMenu
                  className="hamburgerMenu"
                  onClick={() => {
                    setIsOpen(() => !isOpen);

                    // blockScroll()
                  }}
                />
                {/* {isOnamaOpen && (
                <div className="OnamaDropDown" ref={ref}>
                  <Link className="navLinkDrop" href="/o-nama">
                    {router.locale === "hr" ? "Naša priča" : "Our story"}
                  </Link>
                  <Link className="navLinkDrop" href="/marikomerc-kvalitete">
                    Marikomerc kvalitete
                  </Link>
                  <Link className="navLinkDrop" href="/prerada-i-skladiste">
                    Prerada i skladište
                  </Link>
                  <Link className="navLinkDrop" href="/press">
                    PRESS
                  </Link>
                </div>
              )} */}

                <div className="navLinks">
                  <div className="dropdown">
                    <div className="dropdown-content">
                      <Link className="navLinkDrop" href="/o-nama">
                        {locale === "hr" ? "Naša priča" : "Our story"}
                      </Link>
                      <Link
                        className="navLinkDrop"
                        href="/marikomerc-kvalitete"
                      >
                        {locale === "hr"
                          ? "Marikomerc kvaliteta"
                          : "Marikomerc quality"}
                      </Link>
                      <Link className="navLinkDrop" href="/prerada-i-skladiste">
                        {locale === "hr"
                          ? "Prerada i skladište"
                          : "Processing and Storage"}
                      </Link>
                    </div>
                    <div
                      style={{ cursor: "pointer", marginRight: "20px" }}
                      // onMouseOver={handleOnamaOpen}
                    >
                      <Link className="navLink" href="/">
                        {locale === "hr" ? "O nama" : "About us"}
                      </Link>
                      <ArrowDown
                        style={{ position: "relative", marginLeft: "-8px" }}
                      />
                    </div>
                  </div>
                  <div>
                    <Link className="navLink" href="/proizvodi">
                      {locale === "hr" ? "Proizvodi" : "Products"}
                    </Link>
                  </div>
                  <div>
                    <Link className="navLink" href="/horeca">
                      {locale === "hr"
                        ? "HoReCa suradnja"
                        : "HoReCa collaboration"}
                    </Link>
                  </div>
                  <div>
                    <Link className="navLink" href="/karijere">
                      {locale === "hr" ? "Karijere" : "Careers"}
                    </Link>
                  </div>
                  <div>
                    <Link className="navLink" href="/kontakt">
                      {locale === "hr" ? "Kontakt" : "Contact"}
                    </Link>
                  </div>
                  <div>
                    <Link className="navLink" href="/novosti">
                      {locale === "hr" ? "Novosti" : "News"}
                    </Link>
                  </div>
                  <div className="navLink borderNav"></div>
                  <div className="dropdown">
                    <div className="dropdown-content">
                      <Link className="navLinkDrop" href="/MLS">
                        {locale === "hr" ? "MLS Logistika" : "MLS Logistics"}
                      </Link>
                      <Link className="navLinkDrop" href="https://dimaris.hr/">
                        {locale === "hr"
                          ? "DI Maris - Ribarnice"
                          : "DI Maris - Fish market"}
                      </Link>
                      <Link
                        className="navLinkDrop"
                        href="https://perlabisermora.hr/"
                      >
                        {locale === "hr"
                          ? "Perla - Biser Mora"
                          : "Perla - Sea Pearl"}
                      </Link>
                    </div>
                    <div
                      style={{ cursor: "pointer", marginRight: "20px" }}
                      // onMouseOver={handleOnamaOpen}
                    >
                      <Link className="navLink" href="/">
                        {locale === "hr" ? "Grupa" : "Group"}
                      </Link>
                      <ArrowDown
                        style={{ position: "relative", marginLeft: "-8px" }}
                      />
                    </div>
                  </div>
                  <div className="languageSwitcher">
                    {/* <ArrowDown
                    style={{
                      position: "relative",
                      marginLeft: "-8px",
                      marginRight: "5px",
                    }}
                  /> */}

                    <LanguageSwitcher
                      novostiNaslovi={novostiNaslovi}
                      closeMenu={handleCloseMenu}
                      oglasiNaslovi={oglasiNaslovi}
                    />
                  </div>
                  {/* <Veza
                activeClass="active"
                to="prijava"
                spy={true}
                smooth="easeInOutCubic"
                offset={0}
                duration={1800}
              > */}

                  {/* </Veza> */}
                </div>
              </div>
            </div>
          </div>
        </header>
      </Headroom>
    </>
    // </Headroom>
  );
};

// Header.propTypes = {
//   siteTitle: PropTypes.string,
// }

// Header.defaultProps = {
//   siteTitle: ``,
// }

export default Header;
