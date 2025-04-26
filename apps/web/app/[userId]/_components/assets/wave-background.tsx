"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <motion.video
      src="https://xaq0c80u7p.ufs.sh/f/4yVhOQmWtUDzcVy5YmXfZXSu3EHtk4enLwY9poQIjiGMB76z"
      autoPlay
      muted
      loop
      controls={false}
      className="fixed grayscale object-cover bottom-0 z-[-1] hidden md:block pointer-events-none opacity-90"
      style={{ mixBlendMode: "multiply" }} // black magic; the white video background blends into our custom background
    />
  );
};
