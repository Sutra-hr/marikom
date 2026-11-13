import {
  LightBlueBg,
  TopImage,
  WrapAll,
  WrapContent,
  Overlay,
  WrapPhotos2,
  RightSide,
  PerlaLogoWrap,
  LogoWrap,
  TextWrap,
  UpTitle,
  SubTitle,
  Title,
  ListWrap,
  ListItem,
  WrapButton,
  WrapBottom,
  ItemText,
  OverlayTop,
  TextTopImage,
  ImageAbsolute,
} from "./style.js";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useScrollPercentage } from "react-scroll-percentage";

import GreenMark from "../../svg/greenMark.svg";
import Button from "../buttonBlue/Button.js";
import useWindowSize from "../helper/usewindowsize";
import rizotoBg from "../../assets/images/rizotoBg.png";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
import animacija from "./perlaAnimacija.js";
import ReceptiLottie from "./ReceptiLottie.js";
import { useRouter } from "next/router.js";
import en from "../../locales/en.json";
import hr from "../../locales/hr.json";
import AppSection from "./appSection.js";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function PerlaPrviDio() {
  // const [style2, setStyle2] = useState({});
  const size = useWindowSize();

  const router = useRouter();
  const { locale } = router;
  const t = locale === "en" ? en : hr;
  // const interactivity = {
  //   mode: "scroll",
  //   actions: [
  //     {
  //       visibility: [0.2, 1.0],
  //       type: "play",
  //       frames: [0, 24],
  //     },
  //     {
  //       visibility: [0.2, 1.0],
  //       type: "stop",
  //       frames: [25],
  //     },
  //   ],
  // };

  const style =
    size < 1000
      ? {
          height: 120,
        }
      : {
          height: 120,
        };

  const style2 = {
    // height: 520,
    // width: 1000,
  };
  const PerlaLogoAnimacija = () => {
    const options = {
      animationData: animacija,
      loop: false,
      autoplay: true,
      initialSegment: [1, 68],
    };

    return <Lottie {...options} style={style} />;
  };
  const ReceptiAnimacija = () => {
    const options = {
      animationData: ReceptiLottie,
      loop: true,
      autoplay: true,
      initialSegment: [0, 376],
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
        className: "lottie-svg-class",
        id: "lottie-svg-id",
      },
    };
    return <Lottie {...options} style={style2} />;
  };
  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });

  const [ref2, percentage] = useScrollPercentage({
    /* Optional options */
    threshold: 0,
  });

  return (
    <WrapAll ref={ref} bg={rizotoBg}>
      <Overlay>
        <Image src={rizotoBg} alt="Bg" layout="fill" objectFit="cover" />
      </Overlay>
      <WrapBottom>
        <WrapContent>
          <WrapPhotos2>
            <ReceptiAnimacija />
          </WrapPhotos2>
          <RightSide>
            <PerlaLogoWrap>
              <LogoWrap>
                {/* {inView && <PerlaLogoAnimacija />} */}
                <Image
                  src="/perlaLogoWithRed.svg"
                  alt="Perla Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </LogoWrap>
            </PerlaLogoWrap>
            <TextWrap>
              <UpTitle>{t.Perla.topTitle}</UpTitle>
              <Title>{t.Perla.title}</Title>
              <SubTitle>{t.Perla.contactUs}</SubTitle>
              <ListWrap>
                <ListItem>
                  <GreenMark style={{ marginRight: "10px" }} />
                  <ItemText>{t.Perla.line1}</ItemText>
                </ListItem>
                <ListItem>
                  <GreenMark style={{ marginRight: "10px" }} />
                  <ItemText>{t.Perla.line2}</ItemText>
                </ListItem>
                <ListItem>
                  <GreenMark style={{ marginRight: "10px" }} />
                  <ItemText>{t.Perla.line3}</ItemText>
                </ListItem>
                <ListItem>
                  <GreenMark style={{ marginRight: "10px" }} />
                  <ItemText>{t.Perla.line4}</ItemText>
                </ListItem>
                <ListItem>
                  <GreenMark style={{ marginRight: "10px" }} />
                  <ItemText>{t.Perla.line5}</ItemText>
                </ListItem>
              </ListWrap>
              <WrapButton>
                <Button
                  bgcolor="#4299C8"
                  color="#FFFFFF"
                  width="226px"
                  text={t.Perla.button}
                  linkTo="mailto: info@marikomerc.hr"
                />
              </WrapButton>
            </TextWrap>
          </RightSide>
        </WrapContent>
      </WrapBottom>
      <AppSection />
    </WrapAll>
  );
}

export default PerlaPrviDio;
