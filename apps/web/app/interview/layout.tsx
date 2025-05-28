"use client";

import { Authenticated, AuthLoading } from "convex/react";

interface InterviewLayoutProps {
  children: React.ReactNode;
}

export default function InterviewLayout({ children }: InterviewLayoutProps) {
  return (
    <div>
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <p>loading...</p>
      </AuthLoading>
    </div>
  );
}
