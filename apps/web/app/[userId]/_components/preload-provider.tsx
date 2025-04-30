"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { createContext, useContext, ReactNode } from "react";
import { api } from "@residency/api";

// update both of these when you add a new query
type PreloadQueries = {
  applicant: typeof api.user.application.getApplicant;
  interviewStatus: typeof api.user.application.getInterviewStatus;
  maxWaitTime: typeof api.user.application.getMaxWaitTime;
  waitingList: typeof api.user.application.getWaitingList;
};
interface PreloadProviderProps {
  children: ReactNode;
  applicantPreload: PreloadMap["applicant"];
  interviewStatusPreload: PreloadMap["interviewStatus"];
  maxWaitTimePreload: PreloadMap["maxWaitTime"];
  waitingListPreload: PreloadMap["waitingList"];
}

// helper stuff

type PreloadMap = {
  [K in keyof PreloadQueries]: Preloaded<PreloadQueries[K]>;
};
type PreloadResultMap = {
  [K in keyof PreloadQueries]: NonNullable<
    ReturnType<typeof usePreloadedQuery<PreloadQueries[K]>>
  >;
};
type PreloadRecord = Record<string, Preloaded<any>>;

const PreloadContext = createContext<PreloadRecord>({});
export const PreloadProvider = ({
  children,
  ...preloads
}: PreloadProviderProps) => {
  return (
    <PreloadContext.Provider value={preloads}>
      {children}
    </PreloadContext.Provider>
  );
};

export function usePreload<T>(key: string): T {
  const preloads = useContext(PreloadContext);

  if (!preloads || !(key in preloads)) {
    throw new Error(`Preload for "${key}" not found in PreloadProvider`);
  }

  const preload = preloads[key] as Preloaded<any>;
  const result = usePreloadedQuery(preload);

  if (result === null || result === undefined) {
    throw new Error(`Data for "${key}" not available`);
  }

  return result as T;
}

// Typed convenience hooks using our result map
export const useApplicant = (): PreloadResultMap["applicant"] => {
  return usePreload<PreloadResultMap["applicant"]>("applicantPreload");
};

export const useInterviewStatus = (): PreloadResultMap["interviewStatus"] => {
  return usePreload<PreloadResultMap["interviewStatus"]>(
    "interviewStatusPreload"
  );
};

export const useMaxWaitTime = (): PreloadResultMap["maxWaitTime"] => {
  return usePreload<PreloadResultMap["maxWaitTime"]>("maxWaitTimePreload");
};

export const useWaitingList = (): PreloadResultMap["waitingList"] => {
  return usePreload<PreloadResultMap["waitingList"]>("waitingListPreload");
};
