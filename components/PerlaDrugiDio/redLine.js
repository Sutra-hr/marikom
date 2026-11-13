import { RedLine, WrapLogoPerla } from "./style.js";

// import PotpisKaramarko from "../../assets/images/potpiskaramarko.svg";
import Image from "next/image";
import useWindowSize from "../helper/usewindowsize.js";

import { useRouter } from "next/router.js";

import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import animacija from "./perlaAnimacija.js";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function RedLineComp() {
  const style = {
    height: 200,
  };
  const PerlaLogoAnimacija = () => {
    const options = {
      animationData: animacija,
      loop: false,
      autoplay: true,
      initialSegment: [0, 100],
    };

    return <Lottie {...options} style={style} />;
  };

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0.2,
    triggerOnce: true,
  });

  const size = useWindowSize();
  const router = useRouter();

  return (
    <RedLine ref={ref}>
      <WrapLogoPerla>
        {/* <PerlaLogoAnimacija /> */}
        {inView && <PerlaLogoAnimacija />}
      </WrapLogoPerla>
    </RedLine>
  );
}

export default RedLineComp;
