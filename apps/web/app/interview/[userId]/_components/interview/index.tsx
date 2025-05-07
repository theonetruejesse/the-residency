"use client";

import "../position.css";

import * as React from "react";
import { Card } from "@residency/ui/components/card";
import { useConvo } from "./conversation-hook";
import { api, Doc, Id } from "@residency/api";
import { BackgroundWave } from "@/app/[userId]/_components/assets/wave-background";
import { Chalice } from "@/app/[userId]/_components/assets/chalice";
import { InterviewButton } from "./interview-button";
import { useAction } from "convex/react";
import { useEffect, useRef } from "react";

export interface InterviewProps {
  applicant: {
    user: Doc<"users">;
    mission: Doc<"missions">;
    session: Doc<"sessions">;
  };
}
export function Interview(props: InterviewProps) {
  const { status, isSpeaking, startConversation, stopConversation } = useConvo({
    ...props,
  });

  const isConnected = status === "connected";

  useDetectLeave(isConnected, props.applicant.user._id);

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

const useDetectLeave = (isConnected: boolean, userId: Id<"users">) => {
  const leave = useAction(api.user.application.handleLeave);
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    // If we were connected before but not anymore, trigger the leave action
    if (wasConnectedRef.current && !isConnected) {
      leave({ userId });
    }

    // Track connection state for next change
    wasConnectedRef.current = isConnected;
  }, [isConnected, userId, leave]);
};
