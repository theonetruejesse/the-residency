"use client";

import "../position.css";

import * as React from "react";
import { Card } from "@residency/ui/components/card";
import { useConvo } from "./convo-hook";
import { Doc } from "@residency/api";
import { BackgroundWave } from "@/app/[userId]/_components/assets/wave-background";
import { Chalice } from "@/app/[userId]/_components/assets/chalice";
import { InterviewButton } from "./interview-button";

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
    <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center interview-container">
      <BackgroundWave isActivated={isConnected} />
      <div className="w-full flex flex-col justify-center items-center">
        <div className="flex justify-center items-end chalice-base">
          <Chalice isActivated={isConnected} isSpeaking={isSpeaking} />
        </div>
        <Card className="interview-card glass flex flex-col justify-end mb-5">
          <div className="interview-button-container w-full justify-center flex">
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
