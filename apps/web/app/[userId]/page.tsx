import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";
import { PreloadProvider } from "./_components/preload-provider";

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

  const props = await Promise.all([
    preloadQuery(api.user.application.getApplicant, { userId }),
    preloadQuery(api.user.application.getInterviewStatus, { userId }),
    preloadQuery(api.user.application.getMaxWaitTime, { userId }),
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
