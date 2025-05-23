import { POTION_VIDEO_URL, CHALICE_IMG_URL } from "@/lib/constants";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ChaliceProps {
  isActivated: boolean;
  isSpeaking: boolean;
}

export const Chalice = (props: ChaliceProps) => {
  return (
    <div className="relative chalice">
      <ChalicePotion {...props} />
      <ChaliceCup />
    </div>
  );
};

const ChaliceCup = () => {
  return (
    <div className="chalice-cup">
      <Image
        src={CHALICE_IMG_URL}
        alt="Chalice Cup"
        height={1536}
        width={1024}
        className="w-full h-full"
        priority
      />
    </div>
  );
};

const ChalicePotion = (props: ChaliceProps) => {
  const clipPathId = "chalicePotionClipPath";
  const blurFilterId = "potionBlurFilter"; // ID for the blur filter

  const potionOpacity = props.isSpeaking ? 1 : 0.6;

  return (
    <AnimatePresence>
      {props.isActivated && (
        <motion.div
          className="absolute chalice-potion"
          style={{ filter: "drop-shadow(0 0 2px white)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: potionOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.7 }}
        >
          <svg
            viewBox="0 0 122 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id={clipPathId}>
                <path d="M121 10C123.5 11.5 116 20 65.5 20C18.4762 20 0 13.5 0 9.49993C3 7 10.8063 1.40798 56.5 0.999998C112.5 0.5 117.362 7.81717 121 10Z" />
              </clipPath>
              <filter id={blurFilterId}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
            </defs>
            <g style={{ clipPath: `url(#${clipPathId})` }}>
              <foreignObject x="0" y="0" width="122" height="20">
                <div style={{ width: "100%", height: "100%" }}>
                  <motion.video
                    src={POTION_VIDEO_URL}
                    autoPlay
                    muted
                    loop
                    controls={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </foreignObject>
            </g>
            <path
              d="M121 10C123.5 11.5 116 20 65.5 20C18.4762 20 0 13.5 0 9.49993C3 7 10.8063 1.40798 56.5 0.999998C112.5 0.5 117.362 7.81717 121 10Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
              style={{ filter: `url(#${blurFilterId})` }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
