"use client";
import { AnimatePresence, motion } from "framer-motion";
import { WAVE_VIDEO_URL } from "@/lib/constants";
export const BackgroundWave = (props: { isActivated: boolean }) => {
  return (
    <AnimatePresence>
      <div
        className="relative w-full h-full inset-0 wave-container"
        style={{ mixBlendMode: "multiply" }}
      >
        {props.isActivated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.7 }}
          >
            <motion.video
              src={WAVE_VIDEO_URL}
              autoPlay
              muted
              loop
              controls={false}
              className="fixed grayscale object-cover w-full h-full pointer-events-none wave"
            />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
