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
import { formatTime, useInterviewTimer } from "./timer-hook";

interface InterviewButtonProps {
  isConnected: boolean;
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
}
export function InterviewButton({
  isConnected,
  startConversation,
  stopConversation,
}: InterviewButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const timeLeft = useInterviewTimer(isConnected);

  const handleButtonClick = async () => {
    if (!isConnected) {
      await startConversation();
    } else if (timeLeft > 5 * 60) {
      setShowConfirmation(true);
    } else {
      await stopConversation();
    }
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    await stopConversation();
  };

  return (
    <>
      <Button
        variant={isConnected ? "secondary" : "outline"}
        className="rounded-full interview-button w-full"
        size="lg"
        onClick={async () => await handleButtonClick()}
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
  onConfirm: () => Promise<void>;
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
          <Button variant="destructive" onClick={async () => await onConfirm()}>
            End Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
