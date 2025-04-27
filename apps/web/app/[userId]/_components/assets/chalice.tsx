import { POTION_VIDEO_URL, CHALICE_IMG_URL } from "@/lib/constants";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export const Chalice = (props: { isActivated: boolean }) => {
  return (
    // This outer div handles the overall positioning and sizing
    <div className="w-full h-full relative left-5">
      {/* Position the potion absolutely within the container */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10">
        <ChalicePotion isActivated={props.isActivated} />
      </div>
      <ChaliceCup />
    </div>
  );
};

const ChaliceCup = () => {
  return (
    <Image
      src={CHALICE_IMG_URL}
      alt="Chalice Cup"
      height={1536}
      width={1024}
      // slight adjustment to the left to center the cup handle
      className="h-full w-full object-cover"
      priority
    />
  );
};

const ChalicePotion = (props: { isActivated: boolean }) => {
  const clipPathId = "chalicePotionClipPath";
  const blurFilterId = "potionBlurFilter"; // ID for the blur filter

  return (
    <AnimatePresence>
      {props.isActivated && (
        <motion.div
          className="relative right-8"
          style={{ filter: "drop-shadow(0 0 2px white)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.7 }}
        >
          <svg
            width="385"
            height="200"
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
