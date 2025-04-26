import { fetchQuery, preloadQuery } from "convex/nextjs";
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

  const user = await fetchQuery(api.user.users.getUser, {
    userId,
  });

  if (!user) redirect(RESIDENCY_URL);

  const initialSession = await preloadQuery(api.user.session.getSession, {
    userId: user._id,
  });

  return <SessionRouter user={user} initialSession={initialSession} />;
}
