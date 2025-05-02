"use client";

import { ActionButton } from "@/components/action-button";
import { Id, api } from "@residency/api";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ApproveButtonProps {
  userId: Id<"users">;
}
export const ApproveButton = ({ userId }: ApproveButtonProps) => {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);

  const router = useRouter();
  const approve = useAction(api.user.admin.approveIntake);

  useEffect(() => {
    if (sessionId) {
      router.push(`/${userId}`);
    }
  }, [sessionId]);

  const handleClick = async () => {
    const sessionId = await approve({ userId });
    setSessionId(sessionId);
  };

  return (
    <div className="flex flex-col gap-2 mt-10">
      <ActionButton
        handleClick={handleClick}
        actionText="Approve Application*"
        loadingText="Approving..."
      />
      <p className="text-gray-600 text-sm opacity-80 mt-2">
        *Does not exist in production. Approving the application takes a couple
        seconds since we need to generate the first interiew question.
      </p>
    </div>
  );
};
