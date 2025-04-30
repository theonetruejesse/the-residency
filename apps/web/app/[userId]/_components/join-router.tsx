import { api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { Card } from "@residency/ui/components/card";
import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ChaliceChatCopy } from "./assets/chat-copy";
import { useApplicant } from "./preload-provider";
import { WaitingList } from "./waiting-list";

interface JoinRouterProps {
  status: "in_queue" | "join_queue" | "join_call";
  userName: string;
}

export const JoinRouter = ({ status, userName }: JoinRouterProps) => {
  let StatusComponent = null;
  switch (status) {
    case "join_call":
      StatusComponent = <JoinButton isQueue={false} isDisabled={false} />;
      break;
    default:
      StatusComponent = <WaitingList status={status} />;
  }

  return (
    <>
      <JoinSession userName={userName} />
      {StatusComponent}
    </>
  );
};

const JoinSession = ({ userName }: { userName: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <Card className="flex flex-col items-center justify-center gap-4 glass w-[900px] p-8 mx-2">
        <ChaliceChatCopy userName={userName} />
      </Card>
    </div>
  );
};

// either join the queue or join the call
interface JoinButtonProps {
  isQueue: boolean;
  isDisabled: boolean;
}
export const JoinButton = ({ isQueue, isDisabled }: JoinButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleJoin = useAction(api.user.application.handleJoin);
  const applicant = useApplicant();

  return (
    <Button
      size="lg"
      className="w-full text-xl p-6 mt-6"
      onClick={() => {
        setIsLoading(true);
        handleJoin({ userId: applicant.user._id });
      }}
      disabled={isLoading || isDisabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Joining...
        </>
      ) : (
        `Join ${isQueue ? "Queue" : "Call"}`
      )}
    </Button>
  );
};
