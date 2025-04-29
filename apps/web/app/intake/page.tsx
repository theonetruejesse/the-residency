"use client";

import { useEffect, useState } from "react";
import { ResidencyForm } from "./_components/intake-form";
import { Button } from "@residency/ui/components/button";
import { Loader2 } from "lucide-react";
import { api, Id } from "@residency/api";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!userId ? (
        <ResidencyForm setUserId={setUserId} />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Submitted />
          <ApproveButton userId={userId} />
        </div>
      )}
    </div>
  );
}

const Submitted = () => {
  return (
    <div className="text-center glass h-[280px] flex flex-col px-16 items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">
        Thank you for your application!
      </h1>
      <p className="text-gray-600 text-xl">
        We will review your application and get back to you soon.
      </p>
    </div>
  );
};

const ApproveButton = (props: { userId: Id<"users"> }) => {
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
