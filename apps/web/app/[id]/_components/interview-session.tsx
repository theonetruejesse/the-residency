"use client";

import { Doc } from "@residency/api";
import { Button } from "@residency/ui/components/button";

// Use the generated Doc type from Convex for a cleaner type definition
export const InterviewSession = (props: { user: Doc<"users"> }) => {
  const { user } = props;

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello {user.name}</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  );
};
