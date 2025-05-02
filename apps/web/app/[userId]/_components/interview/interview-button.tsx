"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@residency/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@residency/ui/components/dialog";

interface InterviewButtonProps {
  isConnected: boolean;
  startConversation: () => void;
  stopConversation: () => void;
}

export function InterviewButton({
  isConnected,
  startConversation,
  stopConversation,
}: InterviewButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const timeLeft = useInterviewTimer(isConnected, stopConversation);

  const handleButtonClick = () => {
    if (!isConnected) {
      startConversation();
    } else if (timeLeft > 5 * 60) {
      setShowConfirmation(true);
    } else {
      stopConversation();
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    stopConversation();
  };

  return (
    <>
      <Button
        variant={isConnected ? "secondary" : "outline"}
        className="rounded-full interview-button w-full"
        size="lg"
        onClick={handleButtonClick}
      >
        {isConnected ? (
          <span className="flex items-center justify-center">
            End Interview
            <span className="ml-3 text-muted-foreground font-mono tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </span>
        ) : (
          "Start Interview"
        )}
      </Button>

      <ConfirmationDialog
        timeLeft={timeLeft}
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
    </>
  );
}

// Timer hook
const useInterviewTimer = (
  isConnected: boolean,
  stopConversation: () => void
) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected) {
      setTimeLeft(15 * 60);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            stopConversation();
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
  }, [isConnected, stopConversation]);

  return timeLeft;
};

// Time formatting utility
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `(${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")})`;
}

// Confirmation Dialog Component
function ConfirmationDialog({
  timeLeft,
  showConfirmation,
  setShowConfirmation,
  onConfirm,
  onCancel,
}: {
  timeLeft: number;
  showConfirmation: boolean;
  setShowConfirmation: (show: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>End Interview Early?</DialogTitle>
          <DialogDescription>
            There are still {formatTime(timeLeft)} left in this interview. Are
            you sure you want to end it now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Continue Interview
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            End Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
