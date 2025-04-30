import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";

export default async function Page({
  params,
}: {
  params: Promise<{ userIdString: string }>;
}) {
  const { userIdString } = await params;

  const userId = await fetchQuery(api.user.application.userIdFromStr, {
    userIdString,
  });
  if (!userId) redirect(RESIDENCY_URL);

  const applicant = await preloadQuery(api.user.application.getApplicant, {
    userId,
  });

  const interviewStatus = await preloadQuery(
    api.user.application.getInterviewStatus,
    {
      userId,
    }
  );

  if (!applicant || !interviewStatus) redirect(RESIDENCY_URL);
  return (
    <SessionRouter applicant={applicant} interviewStatus={interviewStatus} />
  );
}
