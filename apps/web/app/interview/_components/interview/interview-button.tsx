"use client";

import { useState } from "react";
import { Button } from "@residency/ui/components/button";
import { formatTime, useInterviewTimer } from "./timer-hook";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";

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
    <div className="relative w-full">
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

      <ConfirmationOverlay
        timeLeft={timeLeft}
        showConfirmation={showConfirmation}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}

// Custom Confirmation Overlay Component to prevent weird css issues
function ConfirmationOverlay({
  timeLeft,
  showConfirmation,
  onConfirm,
  onCancel,
}: {
  timeLeft: number;
  showConfirmation: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {showConfirmation && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onCancel}
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg bg-background/95 backdrop-blur-sm sm:max-w-lg"
          >
            <div className="flex flex-col text-center sm:text-left">
              <h3 className="text-lg leading-none font-semibold mb-4">
                End Interview Early?
              </h3>
              <p className="text-muted-foreground text-sm">
                there&apos;s still plenty of time left. are you sure you want to
                end it now?
              </p>

              <p className="text-muted-foreground text-sm">
                time remaining: {formatTime(timeLeft)}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={async () => await onConfirm()}>
                end
              </Button>
              <Button onClick={onCancel}>continue</Button>
            </div>
            <button
              onClick={onCancel}
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
