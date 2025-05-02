"use client";

import { useApplicant, useInterviewStatus } from "./queries/preload-hooks";
import { JoinRouter } from "./join-router";
import { Interview } from "./interview";

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
      <h1>
        Hi {userName}! We're working on evaluating your application. You'll be
        notified when we have more information.
      </h1>
    </div>
  );
};
