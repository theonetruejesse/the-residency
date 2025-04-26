"use client";

import { useState } from "react";
import { ResidencyForm } from "./_components/intake-form";
import { Button } from "@residency/ui/components/button";

import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!userId ? (
        <ResidencyForm setUserId={setUserId} />
      ) : (
        <Submitted userId={userId} />
      )}
    </div>
  );
}

const Submitted = (props: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="text-center glass h-[280px] flex flex-col px-16 items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">
        Thank you for your application!
      </h1>
      <p className="text-gray-600 text-xl">
        We will review your application and get back to you soon.
      </p>

      {/* this will be removed for production */}
      <Button
        size="lg"
        className="w-full mt-10 text-xl p-6"
        onClick={() => {
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
          <Link href={`/${props.userId}`}>Approve Application</Link>
        )}
      </Button>
    </div>
  );
};
