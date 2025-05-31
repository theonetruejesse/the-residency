"use client";

import { api, WaitListMember } from "@residency/api";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAction } from "convex/react";
import { useState } from "react";
import { ActionButton } from "@/components/action-button";
import { useQuerySuspense } from "@/hooks/suspense-query";

interface WaitingListProps {
  status: "in_queue" | "join_queue";
}
export const WaitingList = ({ status }: WaitingListProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const waitingList = useQuerySuspense(api.application.index.getWaitingList);

  return (
    <Card className="w-full glass mb-10 lowercase">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <WaitingListHeader isOpen={isOpen} queueLength={waitingList.length} />
        <WaitingListQueue waitingList={waitingList} />
        <WaitingListFooter status={status} />
      </Collapsible>
    </Card>
  );
};

interface WaitingListHeaderProps {
  isOpen: boolean;
  queueLength: number;
}

const WaitingListHeader = ({ isOpen, queueLength }: WaitingListHeaderProps) => {
  const maxWaitTime = useQuerySuspense(api.application.index.getMaxWaitTime);
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CollapsibleTrigger className="rounded-full h-6 w-6 inline-flex items-center justify-center bg-muted hover:bg-muted-foreground/30">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle queue</span>
          </CollapsibleTrigger>
          <span className="text-lg font-semibold">
            Waiting List: {queueLength}
          </span>
        </div>
        <span className="text-sm font-normal text-muted-foreground">
          Max Wait: ~{maxWaitTime} mins
        </span>
      </CardTitle>
    </CardHeader>
  );
};

interface WaitingListQueueProps {
  waitingList: WaitListMember[];
}
const WaitingListQueue = ({ waitingList }: WaitingListQueueProps) => {
  return (
    <CardContent>
      <CollapsibleContent>
        <div className="space-y-2 mt-2">
          {waitingList.map((member) => (
            <PersonaCard
              key={member.sessionId}
              role={member.role}
              tagline={member.tagline}
            />
          ))}
        </div>
      </CollapsibleContent>
    </CardContent>
  );
};

interface PersonCardProps {
  role: string;
  tagline: string;
}

function PersonaCard({ role, tagline }: PersonCardProps) {
  return (
    <div className="p-3 rounded-lg border bg-card text-card-foreground flex flex-row">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{role}</p>
        <p className="text-xs text-muted-foreground">{tagline}</p>
      </div>
    </div>
  );
}

const WaitingListFooter = ({ status }: WaitingListProps) => {
  const handleJoin = useAction(api.application.index.handleJoin);
  const handleLeave = useAction(api.application.index.handleLeave);

  const isInQueue = status === "in_queue";
  const actionText = isInQueue ? "leave queue" : "join queue";
  const handleClick = isInQueue ? handleLeave : handleJoin;
  const buttonClass = isInQueue
    ? "bg-secondary text-secondary-foreground/80 hover:bg-secondary/60"
    : "";

  return (
    <CardFooter>
      <div className="flex flex-col gap-2 w-full justify-center">
        <ActionButton
          handleClick={async () => {
            await handleClick();
          }}
          actionText={actionText}
          loadingText="processing..."
          className={buttonClass}
        />
        {isInQueue && (
          <p className="text-sm text-muted-foreground">
            *You&apos;ll automatically join the interview once your spot opens
            up.
          </p>
        )}
      </div>
    </CardFooter>
  );
};
