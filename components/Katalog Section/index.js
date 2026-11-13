import {
  WrapAll,
  WrapImages,
  WrapImage,
  WrapIn,
  Overlay,
  Product,
  Name,
  Latin,
  WrapSkladiste,
  BlueLine,
  WrapButton,
} from "./style.js";
import Image from "next/image";
import p1 from "../../assets/images/katalogSection/p1.png";
import p2 from "../../assets/images/katalogSection/p2.png";
import p3 from "../../assets/images/katalogSection/p3.png";
import p4 from "../../assets/images/katalogSection/p4.png";
import grupa from "../../assets/images/katalogSection/grupa.png";
import skladiste from "../../assets/images/skladiste.png";
import Button from "../buttonBlue/Button.js";
import Facts from "./facts/index.js";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

import katalogAnimation from "../../animations/katalogVideo/katalogANimation.js";
import useWindowSize from "../../components/helper/usewindowsize";

function KatalogSection() {
  const size = useWindowSize();
  // const style = {
  //   height: auto,
  // };
  const interactivity = {
    mode: "scroll",
    actions: [
      {
        visibility: [0.1, 2],
        type: "seek",
        frames: [1, 35],
      },
    ],
  };
  return (
    <WrapAll>
      <WrapImages>
        {size.width > 935 ? (
          <>
            <Product>
              <WrapImage>
                <WrapIn>
                  <Image src={p1} alt="p1" layout="fill" objectFit="cover" />
                </WrapIn>
              </WrapImage>
              <Name>Kozica (gamber) cijeli</Name>
              <Latin>lat. Lorem ipsum</Latin>
            </Product>
            <Product>
              <WrapImage>
                <WrapIn>
                  <Image src={p2} alt="p1" layout="fill" objectFit="cover" />
                </WrapIn>
              </WrapImage>{" "}
              <Name>Kozica (gamber) cijeli</Name>
              <Latin>lat. Lorem ipsum</Latin>
            </Product>
            <Product>
              <WrapImage>
                <WrapIn>
                  <Image src={p3} alt="p1" layout="fill" objectFit="cover" />
                </WrapIn>
              </WrapImage>{" "}
              <Name>Kozica (gamber) cijeli</Name>
              <Latin>lat. Lorem ipsum</Latin>
            </Product>
            <Product>
              <WrapImage>
                <WrapIn>
                  <Image src={p4} alt="p1" layout="fill" objectFit="cover" />
                </WrapIn>
              </WrapImage>
              <Name>Kozica (gamber) cijeli</Name>
              <Latin>lat. Lorem ipsum</Latin>
            </Product>
          </>
        ) : (
          <>
            <Product>
              <WrapImage>
                <WrapIn>
                  <Image src={grupa} alt="p1" layout="fill" objectFit="cover" />
                </WrapIn>
                <WrapButton>
                  <Button
                    bgColor="#4299C8"
                    color="#FFFFFF"
                    width="233px"
                    text="Katalog proizvoda"
                    linkTo="/proizvodi"
                  />
                </WrapButton>
              </WrapImage>
            </Product>
          </>
        )}
      </WrapImages>
      {size.width > 935 ? (
        <>
          <Overlay />{" "}
          <Button
            bgColor="#4299C8"
            color="#FFFFFF"
            width="233px"
            text="Katalog proizvoda"
            linkTo="/proizvodi"
          />
        </>
      ) : (
        <></>
      )}

      <Facts />
      <WrapSkladiste>
        <BlueLine />
        {/* <Image src={skladiste} alt="p1" layout="fill" /> */}
        <Lottie
          animationData={katalogAnimation}
          interactivity={interactivity}
          // autoPlay={true}
          loop={false}
        />
      </WrapSkladiste>
    </WrapAll>
  );
}

export default KatalogSection;
