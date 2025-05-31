"use client";

import { Authenticated, AuthLoading } from "convex/react";
import { LoadingSkeleton } from "./_components/loading-skeleton";

interface InterviewLayoutProps {
  children: React.ReactNode;
}

export default function InterviewLayout({ children }: InterviewLayoutProps) {
  return (
    <div className="pt-15 lowercase">
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <LoadingSkeleton />
      </AuthLoading>
    </div>
  );
}
