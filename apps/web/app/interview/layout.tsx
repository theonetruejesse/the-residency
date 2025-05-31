"use client";

import { Authenticated, AuthLoading } from "convex/react";
import { InterviewSkeleton } from "./_components/interview-skeleton";

interface InterviewLayoutProps {
  children: React.ReactNode;
}

export default function InterviewLayout({ children }: InterviewLayoutProps) {
  return (
    <div className="pt-15 lowercase">
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <InterviewSkeleton />
      </AuthLoading>
    </div>
  );
}
