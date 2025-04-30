"use client";

import { Doc, Id, api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ApproveButtonProps {
  userId: Id<"users">;
}
export const ApproveButton = ({ userId }: ApproveButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Doc<"sessions"> | null>(null);

  const router = useRouter();
  const approve = useAction(api.user.admin.approveIntake);

  useEffect(() => {
    if (session) {
      router.push(`/${userId}`);
    }
  }, [session]);

  return (
    <>
      <Button
        size="lg"
        className="w-full mt-10 text-xl p-6"
        onClick={async () => {
          setIsLoading(true);
          const session = await approve({ userId });
          setSession(session);
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
