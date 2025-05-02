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
import { useMutation } from "convex/react";
import { JoinButton } from "./join-router";
import { useState } from "react";

interface WaitingListProps {
  status: "in_queue" | "join_queue";
}
export const WaitingList = ({ status }: WaitingListProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="w-full glass mb-10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <WaitingListHeader isOpen={isOpen} />
        <QueueList />
        <CardFooter>
          <JoinButton isQueue={true} isDisabled={status === "in_queue"} />
        </CardFooter>
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

const QueueList = () => {
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

// todo, use our button component
const LeaveQueueButton = ({ userId }: { userId: Id<"users"> }) => {
  const handleLeave = useMutation(api.user.application.handleLeave);

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
