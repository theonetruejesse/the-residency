"use client";

import { api } from "@residency/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Interview } from "./interview";
import { JoinSession } from "./join-session";

interface SessionRouterProps {
  applicant: Preloaded<typeof api.user.application.getApplicant>;
  interviewStatus: Preloaded<typeof api.user.application.getInterviewStatus>;
}
export const SessionRouter = (props: SessionRouterProps) => {
  // queries should be non-null at this point; we redirect server-side if these are null
  const applicant = usePreloadedQuery(props.applicant)!;
  const interviewStatus = usePreloadedQuery(props.interviewStatus)!;

  const { user } = applicant;

  switch (interviewStatus) {
    case "active_call":
      return <Interview applicant={applicant} />;
    case "in_queue":
      return <JoinSession user={user} />;
    case "join_queue":
      return <JoinSession user={user} />;
    case "join_call":
      return <JoinSession user={user} />;
    case "post_interview":
      return <PostSession userName={user.firstName} />;
  }
};

const PostSession = ({ userName }: { userName: string }) => {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <h1>
        Hi {userName}! We're working on evaluating your application. You'll be
        notified when we have more information.
      </h1>
    </div>
  );
};
