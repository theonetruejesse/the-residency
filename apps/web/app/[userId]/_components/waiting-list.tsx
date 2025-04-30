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
} from "./preload-provider";
import { useMutation } from "convex/react";
import { JoinButton } from "./join-router";
import { useState } from "react";

interface WaitingListProps {
  status: "in_queue" | "join_queue";
}
export const WaitingList = ({ status }: WaitingListProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const maxWaitTime = useMaxWaitTime();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Waiting List</span>
          <span className="text-sm font-normal text-muted-foreground">
            ~{maxWaitTime} wait time
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Queue</h3>
            <CollapsibleTrigger className="rounded-full h-6 w-6 inline-flex items-center justify-center hover:bg-muted">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle queue</span>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <QueueList />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter>
        <JoinButton isQueue={true} isDisabled={status === "in_queue"} />
      </CardFooter>
    </Card>
  );
};

const QueueList = () => {
  const waitingList = useWaitingList();
  const applicant = useApplicant();

  return (
    <div className="space-y-2">
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
        isUser ? "shadow-md border-muted-foreground/20" : "shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-1">
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
    <button
      onClick={() => handleLeave({ userId })}
      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted"
    >
      <X className="h-4 w-4" />
    </button>
  );
};
