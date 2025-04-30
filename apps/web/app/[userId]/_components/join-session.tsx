"use client";

import { Doc, api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { Card } from "@residency/ui/components/card";
import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ChaliceChatCopy } from "./assets/chat-copy";

// todo, add queue logic here
export const JoinSession = (props: { user: Doc<"users"> }) => {
  const { user } = props;

  const joinCall = useAction(api.user.application.joinCall);

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
            joinCall({ userId: user._id });
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
