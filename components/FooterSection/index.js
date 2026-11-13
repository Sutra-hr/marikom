import Logos from "../ProLogMapSection/logos.js";
import {
  WrapAll,
  Container,
  Name,
  MainLinks,
  SingleLink,
  WrapLogo,
  SingleLink2,
  SubLinks,
  Column,
  Column2,
  ColumnIkone,
  SubName,
  Social,
  Copy,
  CopyLink,
  WrapCerts,
  LinkChild,
} from "./style.js";
import MarikomercLogo from "../../assets/svg/marikomerc_logo_footer.svg";
import Instagram from "../../assets/svg/Instagram.svg";
import Facebook from "../../assets/svg/Facebook.svg";
import Linkedin from "../../assets/svg/Linkedin.svg";
import Location from "../../assets/svg/Location.svg";
import Email from "../../assets/svg/Email.svg";
import useWindowSize from "../helper/usewindowsize";
import { useInView } from "react-intersection-observer";
import en from "../../locales/en.json";
import hr from "../../locales/hr.json";
import { useRouter } from "next/router.js";
import Image from "next/image.js";
import { useContext } from "react";
import { AppContext } from "../../pages/_app.js";
function FooterSection() {
  const [category, setCategory] = useContext(AppContext);

  const router = useRouter();
  const { locale } = router;
  const t = locale === "en" ? en : hr;
  const isHR = locale === "hr";
  const size = useWindowSize();
  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <WrapAll>
      <Container>
        <WrapLogo
          ref={ref}
          className={` ${inView ? "inView" : "outView"}`}
        ></WrapLogo>

        <MainLinks>
          <SingleLink href="/o-nama">{t.Linkovi.onama}</SingleLink>
          <SingleLink href="/proizvodi">{t.Linkovi.proizvodi}</SingleLink>
          <SingleLink href="/novosti">{t.Linkovi.novosti}</SingleLink>
          <SingleLink href="/marikomerc-kvalitete">
            {t.Linkovi.kvaliteta}
          </SingleLink>
          <SingleLink href="/karijere">{t.Linkovi.karijere}</SingleLink>
          <SingleLink href="/horeca">{t.Linkovi.horecaSuradnja}</SingleLink>
          <SingleLink href="/kontakt">{t.Linkovi.kontakt}</SingleLink>
        </MainLinks>
        <SubLinks>
          {size.width > 770 ? (
            <>
              <Column>
                <SubName>{t.Linkovi.lokacije}</SubName>
                <SingleLink2 href="/kontakt/#kontakt">Zadar</SingleLink2>
                <SingleLink2 href="/kontakt/#kontakt">Dubrovnik</SingleLink2>
                <SingleLink2 href="/kontakt/#kontakt">Rijeka</SingleLink2>
                {/* <SingleLink2 href="/kontakt/#kontakt">Metković</SingleLink2> */}
              </Column>
              <Column>
                <SubName>{t.Linkovi.proizvodi}</SubName>

                <SingleLink2 href="/proizvodi">
                  <LinkChild onClick={() => setCategory(t.Linkovi.glavonosci)}>
                    {t.Linkovi.glavonosci}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">
                  <LinkChild
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(t.Linkovi.perlaProizvodi)}
                  >
                    {t.Linkovi.perlaProizvodi}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">
                  <LinkChild
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(t.Linkovi.rakovi)}
                  >
                    {t.Linkovi.rakovi}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">
                  <LinkChild
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(t.Linkovi.fileti)}
                  >
                    {t.Linkovi.fileti}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">
                  <LinkChild
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(t.Linkovi.skoljkasi)}
                  >
                    {t.Linkovi.skoljkasi}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">
                  <LinkChild
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(t.Linkovi.ribe)}
                  >
                    {t.Linkovi.ribe}
                  </LinkChild>
                </SingleLink2>
                <SingleLink2 href="/proizvodi">{t.Linkovi.ostali}</SingleLink2>
              </Column>
            </>
          ) : (
            <Column>
              <SubName>{locale === "hr" ? "MENI" : "MENU"}</SubName>
              <SingleLink2 href="/o-nama">{t.Linkovi.onama}</SingleLink2>
              <SingleLink2 href="/proizvodi">{t.Linkovi.proizvodi}</SingleLink2>
              <SingleLink2 href="/novosti">{t.Linkovi.novosti}</SingleLink2>
              <SingleLink2 href="/marikomerc-kvalitete">
                {t.Linkovi.kvaliteta}
              </SingleLink2>
              <SingleLink2 href="/karijere">{t.Linkovi.karijere}</SingleLink2>
              <SingleLink2 href="/horeca">
                {t.Linkovi.horecaSuradnja}
              </SingleLink2>
              <SingleLink2 href="/kontakt">{t.Linkovi.kontakt}</SingleLink2>
            </Column>
          )}

          <Column2>
            <SubName>{t.Linkovi.claniceGrupe}</SubName>
            <SingleLink2 href="/">Marikomerc</SingleLink2>
            <SingleLink2 href="https://dimaris.hr/">
              {locale === "hr" ? "DI Maris Ribarnice" : "DI Maris Fishmarket"}
            </SingleLink2>
            <SingleLink2 href="/MLS">MLS Logistika</SingleLink2>
          </Column2>
          {size.width > 770 && (
            <ColumnIkone>
              <SubName>{t.Linkovi.kontaktirajteNas}</SubName>
              <Social>
                <a href="https://www.instagram.com/marikomerc" target="_blank">
                  <Instagram />
                </a>
                <a href="https://www.facebook.com/marikomerc" target="_blank">
                  <Facebook />
                </a>
                <a
                  href="https://www.linkedin.com/company/marikomerc/"
                  target="_blank"
                >
                  <Linkedin />
                </a>
                <a
                  href="https://www.google.com/maps/@44.1751437,15.3570071,19.73z?entry=ttu"
                  target="_blank"
                >
                  <Location />
                </a>
                <a href="mailto:mls@mls.hr">
                  <Email />
                </a>
              </Social>
              <WrapCerts>
                <Image src="/certifikat/MSC.svg" height={27} width={70} />
                {/* <Image src="/certifikat/ASC.svg" height={27} width={50} /> */}
                <Image src="/certifikat/IFSfood.svg" height={27} width={40} />
                <Image
                  src="/certifikat/zivjetizdravo.svg"
                  height={27}
                  width={35}
                />
                <Image src="/certifikat/ISO9001.svg" height={27} width={30} />
              </WrapCerts>
            </ColumnIkone>
          )}
        </SubLinks>
        {size.width < 770 && (
          <ColumnIkone
            style={{
              width: "70%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "40px",
            }}
          >
            <Social>
              <a href="www.instagram.com">
                <Instagram />
              </a>
              <a href="www.instagram.com">
                <Facebook />
              </a>
              <a href="www.instagram.com">
                <Linkedin />
              </a>
              <a href="www.instagram.com">
                <Location />
              </a>
              <a href="www.instagram.com">
                <Email />
              </a>
            </Social>
            <WrapCerts>
              <Image src="/certifikat/MSC.svg" height={27} width={70} />
              <Image src="/certifikat/ASC.svg" height={27} width={50} />
              <Image src="/certifikat/IFSfood.svg" height={27} width={40} />
              <Image
                src="/certifikat/zivjetizdravo.svg"
                height={27}
                width={35}
              />
              <Image src="/certifikat/ISO9001.svg" height={27} width={30} />
            </WrapCerts>
          </ColumnIkone>
        )}

        <nav className="footer-legal">
          <a href={isHR ? "/politika-privatnosti" : "/en/politika-privatnosti"}>
            <span>{isHR ? "Politika privatnosti" : "Privacy Policy"}</span>
          </a>
          <span className="footer-legal__sep">•</span>
          <a href={isHR ? "/politika-kolacica" : "/en/politika-kolacica"}>
            <span>{isHR ? "Politika kolačića" : "Cookie Policy"}</span>
          </a>
          <span className="footer-legal__sep">•</span>
          <a href={isHR ? "/uvjeti-koristenja" : "/en/uvjeti-koristenja"}>
            <span>{isHR ? "Uvjeti korištenja" : "Terms of Use"}</span>
          </a>
        </nav>

        <Copy>
          <CopyLink>© 2023 MARIKOMERC</CopyLink>
          <CopyLink>
            Web design <strong>SUTRA</strong>{" "}
          </CopyLink>
        </Copy>
      </Container>
    </WrapAll>
  );
}

export default FooterSection;
