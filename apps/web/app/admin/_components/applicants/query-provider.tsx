"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { createApplicantQueryStore, ApplicantQueryStore } from "./query-store";
import { api } from "@residency/api";
import { useStore } from "zustand";

// DISCLAIMER: search filtering is frontend only, so it won't necessarily contain all listed applicants
// if full query is needed, use convex search queries instead

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

  const intake = usePaginatedQuery(
    api.application.admin.intakeApplicants,
    ...PAGINATION_CONFIG
  );

  const first = usePaginatedQuery(
    api.application.admin.firstRoundApplicants,
    ...PAGINATION_CONFIG
  );

  const second = usePaginatedQuery(
    api.application.admin.secondRoundApplicants,
    ...PAGINATION_CONFIG
  );

  const accepted = usePaginatedQuery(
    api.application.admin.acceptedApplicants,
    ...PAGINATION_CONFIG
  );

  const rejected = usePaginatedQuery(
    api.application.admin.rejectedApplicants,
    ...PAGINATION_CONFIG
  );

  const waitlisted = usePaginatedQuery(
    api.application.admin.waitlistedApplicants,
    ...PAGINATION_CONFIG
  );

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

const useApplicantQuery = () => {
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
  const { store } = useApplicantQuery();
  return useStore(store, selector);
};
