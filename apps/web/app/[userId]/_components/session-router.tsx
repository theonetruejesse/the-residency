"use client";

import { api, Doc } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Preloaded, useAction, usePreloadedQuery } from "convex/react";
import { Interview } from "./interview";

interface SessionRouterProps {
  user: Doc<"users">;
  initialSession: Preloaded<typeof api.user.session.getSession>;
}
export const SessionRouter = (props: SessionRouterProps) => {
  const { user, initialSession } = props;

  const session = usePreloadedQuery(initialSession);

  if (!session) return <StartSession user={user} />;

  if (!session.active) return <InactiveSession userName={user.firstName} />;

  return <Interview session={session} user={user} />;
};

const InactiveSession = (props: { userName: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <h1>
        Hi {props.userName}! We're working on evaluating your application.
        You'll be notified when we have more information.
      </h1>
    </div>
  );
};

const StartSession = (props: { user: Doc<"users"> }) => {
  const { user } = props;

  const createSession = useAction(api.user.session.createSession);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hi {user.firstName}!</h1>

        <p className="text-md text-gray-800">
          Welcome to your first round interview for The Residency! This will be
          a 15 minute call with <span className="font-bold">Visionary</span>,
          our residental AI interviewer. The call will take ~15 minutes. MORE
          STUFF...
        </p>
        <Button
          size="sm"
          onClick={() => {
            setIsLoading(true);
            createSession({ userId: user._id });
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Starting Interview...
            </>
          ) : (
            "Start Interview"
          )}
        </Button>
      </div>
    </div>
  );
};
