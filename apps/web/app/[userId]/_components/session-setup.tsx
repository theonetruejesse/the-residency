"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Doc } from "@residency/api";

// Agora requires access to the browser's WebRTC API,
// - which throws an error if it's loaded via SSR
// Create a component that has SSR disabled,
// - and use it to load the AgoraRTC components on the client side
const AgoraProvider = dynamic(
  async () => {
    // Dynamically import Agora's components
    const { AgoraRTCProvider, default: AgoraRTC } = await import(
      "agora-rtc-react"
    );

    return {
      default: ({ children }: { children: React.ReactNode }) => {
        // Create the Agora RTC client once using useMemo
        const client = useMemo(
          () => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
          []
        );
        return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
      },
    };
  },
  { ssr: false } // Important: disable SSR for this component
);

interface SessionSetupProps {
  session: Doc<"sessions">;
}

export const SessionSetup = (props: SessionSetupProps) => {
  const Interview = dynamic(() => import("./interview"), {
    ssr: false,
  });
  return (
    <AgoraProvider>
      <Interview session={props.session} />
    </AgoraProvider>
  );
};
