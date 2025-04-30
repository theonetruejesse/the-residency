import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";
import { PreloadProvider } from "./_components/preload-provider";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const validatedUserId = await fetchQuery(api.user.application.userIdFromStr, {
    userIdString: userId,
  });
  if (!validatedUserId) redirect(RESIDENCY_URL);

  const props = await Promise.all([
    preloadQuery(api.user.application.getApplicant, {
      userId: validatedUserId,
    }),
    preloadQuery(api.user.application.getInterviewStatus, {
      userId: validatedUserId,
    }),
    preloadQuery(api.user.application.getMaxWaitTime, {
      userId: validatedUserId,
    }),
    preloadQuery(api.user.application.getWaitingList, {}),
  ]);

  // Redirect if any preloads are missing
  if (props.some((p) => p === null)) redirect(RESIDENCY_URL);

  return (
    <PreloadProvider
      applicantPreload={props[0]}
      interviewStatusPreload={props[1]}
      maxWaitTimePreload={props[2]}
      waitingListPreload={props[3]}
    >
      <SessionRouter />
    </PreloadProvider>
  );
}
