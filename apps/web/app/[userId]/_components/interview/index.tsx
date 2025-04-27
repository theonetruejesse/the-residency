"use client";

import { Button } from "@residency/ui/components/button";
import * as React from "react";
import { Card } from "@residency/ui/components/card";
import { useConvo } from "./convo-hook";
import { Doc } from "@residency/api";
import { BackgroundWave } from "@/app/[userId]/_components/assets/wave-background";
import { Chalice } from "@/app/[userId]/_components/assets/chalice";

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
            <Button
              variant={isConnected ? "secondary" : "outline"}
              className={"rounded-full w-full text-lg p-6"}
              size={"lg"}
              onClick={() =>
                isConnected ? stopConversation() : startConversation()
              }
            >
              {isConnected ? "End Interview" : "Start Interview"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
