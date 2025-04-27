"use client";

import { Button } from "@residency/ui/components/button";
import * as React from "react";
import { Card } from "@residency/ui/components/card";
import { useConvo } from "./convo-hook";
import { Doc } from "@residency/api";
import { BackgroundWave } from "@/app/[userId]/_components/assets/wave-background";
import { Chalice } from "@/app/[userId]/_components/assets/chalice";
import { useEffect, useRef, useState } from "react";

export interface InterviewProps {
  session: Doc<"sessions">;
  applicant: { user: Doc<"users">; mission: Doc<"missions"> };
}
export function Interview(props: InterviewProps) {
  const { status, isSpeaking, startConversation, stopConversation } = useConvo({
    ...props,
  });

  const isConnected = status === "connected";

  return (
    <div className="flex min-h-screen flex-col items-center justify-end relative overflow-hidden">
      <BackgroundWave isActivated={isConnected} />

      <div className="relative w-full max-w-xl mx-auto mb-8">
        <Card className="relative w-full h-60 overflow-visible glass">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-[85%] z-30  h-[70vh] w-[110%]">
            <Chalice isActivated={isConnected} />
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-20 px-10">
            <InterviewButton
              isConnected={isConnected}
              startConversation={startConversation}
              stopConversation={stopConversation}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface InterviewButtonProps {
  isConnected: boolean;
  startConversation: () => void;
  stopConversation: () => void;
}

const InterviewButton = ({
  isConnected,
  startConversation,
  stopConversation,
}: InterviewButtonProps) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start or stop timer based on connection status
  useEffect(() => {
    if (isConnected) {
      // Start timer when interview starts
      setTimeLeft(15 * 60); // Reset to 15 minutes
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            // Auto-stop the conversation when timer reaches zero
            stopConversation();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Stop timer when interview ends
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, stopConversation]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `(${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")})`;
  };

  return (
    <Button
      variant={isConnected ? "secondary" : "outline"}
      className="rounded-full w-full text-lg p-6"
      size="lg"
      onClick={() => (isConnected ? stopConversation() : startConversation())}
    >
      {isConnected ? (
        <span className="flex items-center justify-center">
          End Interview
          <span className="ml-2 text-muted-foreground font-mono tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </span>
      ) : (
        "Start Interview"
      )}
    </Button>
  );
};
