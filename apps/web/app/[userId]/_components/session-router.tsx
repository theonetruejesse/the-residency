"use client";

import { api, Doc } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Preloaded, useAction, usePreloadedQuery } from "convex/react";
import { Interview } from "./interview";
import { Card } from "@residency/ui/components/card";
import { ChaliceChatCopy } from "./assets/chat-copy";

interface SessionRouterProps {
  applicant: { user: Doc<"users">; mission: Doc<"missions"> };
  initialSession: Preloaded<typeof api.user.session.getSession>;
}
export const SessionRouter = (props: SessionRouterProps) => {
  const { applicant, initialSession } = props;

  const session = usePreloadedQuery(initialSession);

  if (!session) return <StartSession user={applicant.user} />;

  if (!session.active)
    return <InactiveSession userName={applicant.user.firstName} />;

  return <Interview session={session} applicant={applicant} />;
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
      <Card className="flex flex-col items-center justify-center gap-4 glass w-[900px] p-8 mx-2">
        <ChaliceChatCopy userName={user.firstName} />
        <Button
          size="lg"
          className="w-full text-xl p-6 mt-6"
          onClick={() => {
            setIsLoading(true);
            createSession({ userId: user._id });
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Joining Interview...
            </>
          ) : (
            "Join Interview"
          )}
        </Button>
      </Card>
    </div>
  );
};
