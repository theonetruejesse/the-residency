import { preloadQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const applicant = await preloadQuery(api.user.application.getApplicant, {
    userId,
  });

  if (!applicant) redirect(RESIDENCY_URL);
  return <SessionRouter applicant={applicant} />;
}
