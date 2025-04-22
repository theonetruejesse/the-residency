import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api, Id } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
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

  return <SessionRouter user={user} initialSession={initialSession} />;
}
