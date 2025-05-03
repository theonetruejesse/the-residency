"use client";

import { useApplicant, useInterviewStatus } from "./queries/preload-hooks";
import { JoinRouter } from "./join-router";
import { Interview } from "./interview";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@residency/ui/components/card";

export const SessionRouter = () => {
  const applicant = useApplicant();
  const interviewStatus = useInterviewStatus();

  switch (interviewStatus) {
    case "active_call":
      return <Interview applicant={applicant} />;
    case "post_interview":
      return <PostSession userName={applicant.user.firstName} />;
    default:
      return (
        <JoinRouter
          status={interviewStatus}
          userName={applicant.user.firstName}
        />
      );
  }
};

const PostSession = ({ userName }: { userName: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <Card className="w-[600px] glass">
        <CardHeader>
          <CardTitle className="text-2xl">Thanks for Interviewing!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            Hi {userName}, we're working on evaluating your interivew. We'll
            email you with the results as soon as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
