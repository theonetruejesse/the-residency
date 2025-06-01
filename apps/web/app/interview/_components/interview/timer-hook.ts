"use client";

import { useEffect, useRef, useState } from "react";

const MAX_TIME = 10 * 60; // 10 minute call

export const useInterviewTimer = (isConnected: boolean) => {
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected) {
      setTimeLeft(MAX_TIME);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  return timeLeft;
};

// Time formatting utility
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `(${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")})`;
};
