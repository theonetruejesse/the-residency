"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WAVE_VIDEO_URL } from "@/lib/constants";
export const BackgroundWave = (props: { isActivated: boolean }) => {
  return (
    <div
      className="relative w-full h-full inset-0 wave-container"
      style={{ mixBlendMode: "multiply" }}
    >
      <AnimatePresence>
        {props.isActivated && (
          <motion.video
            key="wave-video"
            src={WAVE_VIDEO_URL}
            autoPlay
            muted
            loop
            controls={false}
            preload="auto"
            className="fixed grayscale object-cover w-full h-full pointer-events-none wave"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.7, ease: "easeInOut" }}
            style={{ opacity: 0 }}
            onLoadedData={(e) => {
              (e.target as HTMLVideoElement).style.opacity = "";
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
