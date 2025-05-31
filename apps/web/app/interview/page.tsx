"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@residency/ui/components/card";
import { Interview } from "./_components/interview";
import { JoinRouter } from "./_components/join-router";
import { api } from "@residency/api";
import { useQuerySuspense } from "@/hooks/suspense-query";
import { Suspense } from "react";
import { LoadingSkeleton } from "./_components/loading-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SessionRouter />
    </Suspense>
  );
}

const SessionRouter = () => {
  const applicant = useQuerySuspense(api.application.index.getProfile);
  const sessionStatus = useQuerySuspense(
    api.application.index.getSessionStatus
  );

  switch (sessionStatus) {
    case "active_call":
      return <Interview applicant={applicant} />;
    case "post_interview":
      return <PostSession firstName={applicant.basicInfo.firstName} />;
    default:
      return (
        <JoinRouter
          status={sessionStatus}
          firstName={applicant.basicInfo.firstName}
        />
      );
  }
};

const PostSession = ({ firstName }: { firstName: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh pb-15">
      <Card className="w-[600px] glass">
        <CardHeader>
          <CardTitle className="text-2xl">Thanks for Interviewing!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            hi {firstName}, we&apos;re working on evaluating your interview.
            we&apos;ll email you with the results as soon as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
