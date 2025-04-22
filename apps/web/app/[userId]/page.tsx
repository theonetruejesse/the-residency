import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api, Id } from "@residency/api";
import { InterviewSession } from "./_components/interview-session";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await fetchQuery(api.users.getUser, {
    userId: userId as Id<"users">,
  });

  if (!user) redirect(RESIDENCY_URL);

  const initialSession = await preloadQuery(api.users.getSession, {
    userId: user._id,
  });

  return <InterviewSession user={user} initialSession={initialSession} />;
}
