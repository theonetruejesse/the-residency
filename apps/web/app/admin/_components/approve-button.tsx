"use client";

import { Id, api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { useAction, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export const ApproveButton = (props: { userId: Id<"users"> }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const approve = useAction(api.user.application.approveIntake);
  const session = useQuery(api.user.application.getUserSession, {
    userId: props.userId,
  });

  useEffect(() => {
    if (session) {
      router.push(`/${props.userId}`);
    }
  }, [session]);

  return (
    <>
      <Button
        size="lg"
        className="w-full mt-10 text-xl p-6"
        onClick={() => {
          approve({ userId: props.userId });
          setIsLoading(true);
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Approving Application...
          </>
        ) : (
          "Approve Application*"
        )}
      </Button>
      <p className="text-gray-600 text-sm opacity-80 mt-2">
        *Does not exist in production. Approving the application takes a couple
        seconds since we need to generate the first interiew question.
      </p>
    </>
  );
};
