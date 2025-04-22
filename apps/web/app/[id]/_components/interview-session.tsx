"use client";

import { Doc } from "@residency/api";
import { Button } from "@residency/ui/components/button";

export const InterviewSession = (props: { user: Doc<"users"> }) => {
  const { user } = props;

  if (!user.active) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <h1>
          Hi {user.name}! We're working on evaluating your application. You'll
          be notified when we have more information.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hi {user.name}!</h1>

        <p className="text-md text-gray-800">
          Welcome to your first round interview for The Residency! This will be
          a 15 minute call with <span className="font-bold">Visionary</span>,
          our residental AI interviewer. The call will take ~15 minutes. MORE
          STUFF...
        </p>
        <Button size="sm">Start Interview</Button>
      </div>
    </div>
  );
};
