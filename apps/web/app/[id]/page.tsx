import { fetchQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { InterviewSession } from "./_components/interview-session";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) redirect(RESIDENCY_URL);

  const user = await fetchQuery(api.users.getUser, {
    userId,
  });

  if (!user) redirect(RESIDENCY_URL);

  // return <InterviewSession user={user} />;

  return <div>hello</div>;
}
