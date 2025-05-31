import { api } from "@residency/api";
import { useAction } from "convex/react";
import { ChaliceChatCopy } from "./assets/chat-copy";
import { WaitingList } from "./waiting-list";
import { ActionButton } from "@/components/action-button";

interface JoinRouterProps {
  status: "in_queue" | "join_queue" | "join_call";
  firstName: string;
}
export const JoinRouter = ({ status, firstName }: JoinRouterProps) => {
  let StatusComponent = null;
  switch (status) {
    case "join_call":
      StatusComponent = <JoinCallButton />;
      break;
    default:
      StatusComponent = <WaitingList status={status} />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-[900px]">
        <ChaliceChatCopy firstName={firstName} />
        {StatusComponent}
      </div>
    </div>
  );
};

const JoinCallButton = () => {
  const handleJoin = useAction(api.application.index.handleJoin);
  return (
    <ActionButton
      handleClick={async () => await handleJoin()}
      actionText="join interview"
      loadingText="joining..."
    />
  );
};
