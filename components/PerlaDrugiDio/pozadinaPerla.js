import {
  WrapAll,
  RedLine,
  RedLine2,
  WrapLogo,
  PozadinaPerla,
  WrapLogoPerla,
  Title,
  Title2,
  Text,
  Proizvodi,
  Proizvod,
  Overlay,
  WrapProizvod,
  WrapProizvodImage,
  ProizvodName,
  ProizvodWeight,
  Button,
  Karamarko,
  Left,
  Right,
  Potpis,
  LogoHks,
  ImageWrap,
} from "./style.js";

// import PotpisKaramarko from "../../assets/images/potpiskaramarko.svg";
import PotpisKaramarko from "../../assets/images/potpiskaramarko.png";
import Image from "next/image";
import useWindowSize from "../helper/usewindowsize.js";
import { useScrollPercentage } from "react-scroll-percentage";
import { catalogData } from "../../catalogData.js";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router.js";
import en from "../../locales/en.json";
import hr from "../../locales/hr.json";
import { useInView } from "react-intersection-observer";
import animacija from "./perlaAnimacija.js";
import Link from "next/link.js";
import RedLineComp from "./redLine.js";

function PozadinaPerlaComp() {
  const [ref, percentage] = useScrollPercentage({
    /* Optional options */
    threshold: 0,
  });

  return (
    <Left ref={ref}>
      <PozadinaPerla>
        <Image src="/perlaLogo.svg" layout="fill" />
      </PozadinaPerla>
      <ImageWrap></ImageWrap>
      <Potpis percentage={percentage}>
        <Image src={PotpisKaramarko} alt="p2" objectFit="cover" />
      </Potpis>
    </Left>
  );
}

export default PozadinaPerlaComp;
