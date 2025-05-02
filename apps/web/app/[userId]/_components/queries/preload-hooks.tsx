"use client";

import { api } from "@residency/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { createContext, useContext, ReactNode } from "react";

export type PreloadedApplicationData = {
  applicantPreload: Preloaded<typeof api.user.application.getApplicant>;
  maxWaitTimePreload: Preloaded<typeof api.user.application.getMaxWaitTime>;
  waitingListPreload: Preloaded<typeof api.user.application.getWaitingList>;
  interviewStatusPreload: Preloaded<
    typeof api.user.application.getInterviewStatus
  >;
};

export function useApplicant() {
  const { applicantPreload } = usePreloadContext();
  const applicant = usePreloadedQuery(applicantPreload);
  if (!applicant) throw new Error("Applicant not found");
  return applicant;
}

export function useInterviewStatus() {
  const { interviewStatusPreload } = usePreloadContext();
  const status = usePreloadedQuery(interviewStatusPreload);
  if (!status) throw new Error("Interview status not found");
  return status;
}

export function useMaxWaitTime() {
  const { maxWaitTimePreload } = usePreloadContext();
  const maxWaitTime = usePreloadedQuery(maxWaitTimePreload);
  if (!maxWaitTime) throw new Error("Max wait time not found");
  return maxWaitTime;
}

export function useWaitingList() {
  const { waitingListPreload } = usePreloadContext();
  const waitingList = usePreloadedQuery(waitingListPreload);
  if (!waitingList) throw new Error("Waiting list not found");
  return waitingList;
}

const PreloadContext = createContext<PreloadedApplicationData | null>(null);

// need seperate provider for handling server and client component differences
export const PreloadClientProvider = ({
  children,
  ...preloadedData
}: PreloadedApplicationData & { children: ReactNode }) => {
  return (
    <PreloadContext.Provider value={preloadedData}>
      {children}
    </PreloadContext.Provider>
  );
};

function usePreloadContext(): PreloadedApplicationData {
  const ctx = useContext(PreloadContext);
  if (!ctx)
    throw new Error("usePreloadContext must be used within a PreloadProvider");
  return ctx;
}
