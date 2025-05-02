"use client";

import { useConversation } from "@11labs/react";
import { useCallback } from "react";
import { InterviewProps } from "./index.js";
import { useAction } from "convex/react";
import { api } from "@residency/api";

const sessionConfig = (props: InterviewProps) => {
  const { session, user, mission } = props.applicant;
  return {
    signedUrl: session.sessionUrl!, // at this point, sessionUrl should be non-null
    dynamicVariables: {
      user_name: user.firstName,
      user_interest: mission.interest,
      user_accomplishment: mission.accomplishment,
      first_question: session.firstQuestion,
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

export function useConvo(props: InterviewProps) {
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

  const stopConversation = useCallback(async () => {
    const leave = useAction(api.user.application.handleLeave);

    await leave({ userId: props.applicant.user._id });
    await conversation.endSession();
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    startConversation,
    stopConversation,
  };
}
