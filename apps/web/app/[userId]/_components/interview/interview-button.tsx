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
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle button click
  const handleButtonClick = () => {
    if (!isConnected) {
      // Start interview
      startConversation();
    } else {
      // Check if more than 10 minutes left
      if (timeLeft > 10 * 60) {
        setShowConfirmation(true);
      } else {
        // Less than 10 minutes left, end directly
        stopConversation();
      }
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    setShowConfirmation(false);
    stopConversation();
  };

  // Handle cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
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
            <span className="ml-2 text-muted-foreground font-mono tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </span>
        ) : (
          "Start Interview"
        )}
      </Button>

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
            <Button variant="outline" onClick={handleCancel}>
              Continue Interview
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
