"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { createApplicantQueryStore, ApplicantQueryStore } from "./query-store";
import { api } from "@residency/api";
import { useStore } from "zustand";

// DISCLAIMER: search filtering is frontend only, so it won't necessarily contain all listed applicants
// if full query is needed, use convex search queries instead

const useProvider = () => {
  const context = useContext(ApplicantQueryContext);
  if (!context) {
    throw new Error(
      "useApplicantQuery must be used within ApplicantQueryProvider"
    );
  }
  return context;
};

// Helper hook to use the store reactively
export const useApplicantStore = <T,>(
  selector: (state: ApplicantQueryStore) => T
): T => {
  const { store } = useProvider();
  return useStore(store, selector);
};

const PAGINATION_CONFIG = [
  {
    paginationOpts: {
      numItems: 20,
    },
  },
  { initialNumItems: 20 },
] as const;

const ApplicantQueryContext = createContext<{
  store: ReturnType<typeof createApplicantQueryStore>;
} | null>(null);

interface ApplicantQueryProviderProps {
  children: React.ReactNode;
}
export const ApplicantQueryProvider = ({
  children,
}: ApplicantQueryProviderProps) => {
  const [store] = useState(() => createApplicantQueryStore());

  // Intake
  const intakeData = usePaginatedQuery(
    api.application.admin.intakeApplicants,
    ...PAGINATION_CONFIG
  );
  const intakeTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "intake",
    }) ?? 0;
  const intake = {
    ...intakeData,
    totalCount: intakeTotal,
  };

  // First Round
  const firstData = usePaginatedQuery(
    api.application.admin.firstRoundApplicants,
    ...PAGINATION_CONFIG
  );
  const firstTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "first_round",
    }) ?? 0;
  const first = {
    ...firstData,
    totalCount: firstTotal,
  };

  // Second Round
  const secondData = usePaginatedQuery(
    api.application.admin.secondRoundApplicants,
    ...PAGINATION_CONFIG
  );
  const secondTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "second_round",
    }) ?? 0;
  const second = {
    ...secondData,
    totalCount: secondTotal,
  };

  // Accepted
  const acceptedData = usePaginatedQuery(
    api.application.admin.acceptedApplicants,
    ...PAGINATION_CONFIG
  );
  const acceptedTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "accepted",
    }) ?? 0;
  const accepted = {
    ...acceptedData,
    totalCount: acceptedTotal,
  };

  // Rejected
  const rejectedData = usePaginatedQuery(
    api.application.admin.rejectedApplicants,
    ...PAGINATION_CONFIG
  );
  const rejectedTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "rejected",
    }) ?? 0;
  const rejected = {
    ...rejectedData,
    totalCount: rejectedTotal,
  };

  // Waitlisted
  const waitlistedData = usePaginatedQuery(
    api.application.admin.waitlistedApplicants,
    ...PAGINATION_CONFIG
  );
  const waitlistedTotal =
    useQuery(api.application.admin.totalCount, {
      opt: "waitlisted",
    }) ?? 0;
  const waitlisted = {
    ...waitlistedData,
    totalCount: waitlistedTotal,
  };

  useEffect(() => {
    store.getState().setQueryResults("intake", intake);
  }, [intake]);

  useEffect(() => {
    store.getState().setQueryResults("firstRound", first);
  }, [first]);

  useEffect(() => {
    store.getState().setQueryResults("secondRound", second);
  }, [second]);

  useEffect(() => {
    store.getState().setQueryResults("accepted", accepted);
  }, [accepted]);

  useEffect(() => {
    store.getState().setQueryResults("rejected", rejected);
  }, [rejected]);

  useEffect(() => {
    store.getState().setQueryResults("waitlisted", waitlisted);
  }, [waitlisted]);

  return (
    <ApplicantQueryContext.Provider value={{ store }}>
      {children}
    </ApplicantQueryContext.Provider>
  );
};
