"use server";

import { RESIDENCY_URL } from "@/lib/constants";
import { api, Id } from "@residency/api";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import {
  PreloadClientProvider,
  type PreloadedApplicationData,
} from "./preload-hooks";

const preloadQueries = async (
  userId: Id<"users">
): Promise<PreloadedApplicationData> => {
  const props = await Promise.all([
    preloadQuery(api.user.application.getApplicant, { userId }),
    preloadQuery(api.user.application.getInterviewStatus, { userId }),
    preloadQuery(api.user.application.getMaxWaitTime, { userId }),
    preloadQuery(api.user.application.getWaitingList, {}),
  ]);

  if (props.some((prop) => prop === null)) redirect(RESIDENCY_URL);

  return {
    applicantPreload: props[0],
    interviewStatusPreload: props[1],
    maxWaitTimePreload: props[2],
    waitingListPreload: props[3],
  };
};

interface PreloadProviderProps {
  userId: Id<"users">;
  children: ReactNode;
}

export const PreloadProvider = async ({
  userId,
  children,
}: PreloadProviderProps) => {
  const preload = await preloadQueries(userId);

  return <PreloadClientProvider {...preload}>{children}</PreloadClientProvider>;
};
