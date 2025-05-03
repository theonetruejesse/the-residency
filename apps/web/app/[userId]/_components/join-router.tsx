import { api } from "@residency/api";
import { useAction } from "convex/react";
import { ChaliceChatCopy } from "./assets/chat-copy";
import { useApplicant } from "./queries/preload-hooks";
import { WaitingList } from "./waiting-list";
import { ActionButton } from "@/components/action-button";

interface JoinRouterProps {
  status: "in_queue" | "join_queue" | "join_call";
  userName: string;
}

export const JoinRouter = ({ status, userName }: JoinRouterProps) => {
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
      <div className="w-[900px] mt-15">
        <ChaliceChatCopy userName={userName} />
        {StatusComponent}
      </div>
    </div>
  );
};

const JoinCallButton = () => {
  const applicant = useApplicant();
  const handleJoin = useAction(api.user.application.handleJoin);
  return (
    <ActionButton
      handleClick={() => {
        handleJoin({ userId: applicant.user._id });
      }}
      actionText="Join Interview"
      loadingText="Joining..."
    />
  );
};
