"use client";

import "../position.css";

import * as React from "react";
import { Card } from "@residency/ui/components/card";
import { useConvo } from "./conversation-hook";
import { api, type ApplicantProfile } from "@residency/api";
import { Chalice } from "../assets/chalice";
import { BackgroundWave } from "../assets/wave-background";
import { InterviewButton } from "./interview-button";
import { useAction } from "convex/react";
import { useEffect, useRef } from "react";

export interface InterviewProps {
  applicant: ApplicantProfile;
}
export function Interview(props: InterviewProps) {
  const { id, basicInfo, mission, session } = props.applicant;

  const { status, isSpeaking, startConversation, stopConversation } = useConvo({
    id: id as string,
    name: basicInfo.firstName,
    interest: mission.interest,
    accomplishment: mission.accomplishment,
    sessionUrl: session.sessionUrl!, // at this point, sessionUrl should be non-null
  });

  const isConnected = status === "connected";
  useDetectLeave(isConnected);

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

const useDetectLeave = (isConnected: boolean) => {
  const leave = useAction(api.application.index.handleLeave);
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    // If we were connected before but not anymore, trigger the leave action
    if (wasConnectedRef.current && !isConnected) {
      leave();
    }

    // Track connection state for next change
    wasConnectedRef.current = isConnected;
  }, [isConnected, leave]);
};
