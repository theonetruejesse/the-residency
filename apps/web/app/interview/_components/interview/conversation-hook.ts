"use client";

import { useConversation } from "@11labs/react";
import { useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@residency/api";

interface SessionConfigProps {
  name: string;
  id: string;
  interest: string;
  accomplishment: string;
  sessionUrl: string;
}

const sessionConfig = ({
  name,
  id,
  interest,
  accomplishment,
  sessionUrl,
}: SessionConfigProps) => {
  return {
    signedUrl: sessionUrl,
    dynamicVariables: {
      applicant_name: name,
      applicant_id: id,
      applicant_interest: interest,
      applicant_accomplishment: accomplishment,
    },
  };
};

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

export function useConvo(props: SessionConfigProps) {
  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
    },
    onDisconnect: () => {
      console.log("disconnected");
    },
    onError: (error) => {
      console.log(error);
      alert("An error occurred during the conversation");
    },
    onMessage: (message) => {
      console.log(message);
    },
  });

  const leave = useAction(api.application.index.handleLeave);
  const stopConversation = useCallback(async () => {
    await leave();
    await conversation.endSession();
  }, [conversation, leave]);

  const startConversation = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    try {
      await conversation.startSession({
        ...sessionConfig(props),
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation. Please check the console.");
    }
  };

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    startConversation,
    stopConversation,
  };
}
