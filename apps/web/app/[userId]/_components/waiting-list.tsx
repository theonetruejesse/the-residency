"use client";

import { api, Id } from "@residency/api";
import {
  CardFooter,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@residency/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@residency/ui/components/collapsible";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  useApplicant,
  useMaxWaitTime,
  useWaitingList,
} from "./queries/preload-hooks";
import { useAction } from "convex/react";
import { useState } from "react";
import { ActionButton } from "@/components/action-button";

interface WaitingListProps {
  status: "in_queue" | "join_queue";
}
export const WaitingList = ({ status }: WaitingListProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="w-full glass mb-10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <WaitingListHeader isOpen={isOpen} />
        <WaitingListQueue />
        <WaitingListFooter status={status} />
      </Collapsible>
    </Card>
  );
};

const WaitingListHeader = ({ isOpen }: { isOpen: boolean }) => {
  const maxWaitTime = useMaxWaitTime();
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CollapsibleTrigger className="rounded-full h-6 w-6 inline-flex items-center justify-center hover:bg-muted">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle queue</span>
          </CollapsibleTrigger>
          <span className="text-lg font-semibold">Waiting List</span>
        </div>
        <span className="text-sm font-normal text-muted-foreground">
          Max Wait: ~{maxWaitTime} mins
        </span>
      </CardTitle>
    </CardHeader>
  );
};

const WaitingListQueue = () => {
  const waitingList = useWaitingList();
  const applicant = useApplicant();

  return (
    <CardContent>
      <CollapsibleContent>
        <div className="space-y-2 mt-2">
          {waitingList.map((persona) => (
            <PersonaCard
              userId={applicant.user._id}
              userSessionId={applicant.session._id}
              key={persona.sessionId}
              sessionId={persona.sessionId}
              role={persona.role}
              tagline={persona.tagline}
            />
          ))}
        </div>
      </CollapsibleContent>
    </CardContent>
  );
};

interface PersonCardProps {
  userId: Id<"users">;
  userSessionId: Id<"sessions">;
  sessionId: Id<"sessions">;
  role: string;
  tagline: string;
}

function PersonaCard({
  userId,
  userSessionId,
  sessionId,
  role,
  tagline,
}: PersonCardProps) {
  const isUser = sessionId === userSessionId;

  return (
    <div
      className={`p-3 rounded-lg border bg-card text-card-foreground relative ${
        isUser ? "border-2 border-muted-foreground/20" : ""
      }`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{role}</p>
        <p className="text-xs text-muted-foreground">{tagline}</p>
      </div>

      {isUser && <LeaveQueueButton userId={userId} />}
    </div>
  );
}

// todo, use our button component for loading state
const LeaveQueueButton = ({ userId }: { userId: Id<"users"> }) => {
  const handleLeave = useAction(api.user.application.handleLeave);

  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full items-center justify-center flex flex-col border-l-2 border-muted-foreground/20 pl-2">
      <button
        onClick={() => handleLeave({ userId })}
        className="h-6 w-6 rounded-full hover:bg-muted justify-center items-center flex text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const WaitingListFooter = ({ status }: WaitingListProps) => {
  const isShowNote = status === "in_queue";
  return (
    <CardFooter>
      <div className="flex flex-col gap-2 w-full justify-center">
        <QueueButton status={status} />
        {isShowNote && (
          <p className="text-sm text-muted-foreground">
            *You'll automatically join the interview once your spot opens up.
          </p>
        )}
      </div>
    </CardFooter>
  );
};

const QueueButton = ({ status }: WaitingListProps) => {
  const applicant = useApplicant();
  const handleJoin = useAction(api.user.application.handleJoin);

  const actionText = status === "in_queue" ? "In Queue*" : "Join Queue";
  const isDisabled = status === "in_queue";

  return (
    <ActionButton
      handleClick={async () => {
        await handleJoin({ userId: applicant.user._id });
      }}
      actionText={actionText}
      loadingText="Joining..."
      isDisabled={isDisabled}
    />
  );
};
