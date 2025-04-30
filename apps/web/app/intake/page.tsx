"use client";

import { useState } from "react";
import { ResidencyForm } from "./_components/intake-form";
import { Id } from "@residency/api";

import Link from "next/link";

export default function Page() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!userId ? <ResidencyForm setUserId={setUserId} /> : <Submitted />}
    </div>
  );
}

const Submitted = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center glass h-[280px] flex flex-col px-16 items-center justify-center">
        <h1 className="text-5xl font-bold mb-4">
          Thank you for your application!
        </h1>
        <p className="text-gray-600 text-xl">
          We will review your application and get back to you soon.
        </p>
        <Link className="mt-8" href="/admin">
          click here for admin view.
        </Link>
      </div>
    </div>
  );
};
