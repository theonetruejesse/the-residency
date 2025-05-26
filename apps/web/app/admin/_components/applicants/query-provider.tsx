"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { usePaginatedQuery } from "convex/react";
import {
  createApplicantQueryStore,
  ApplicantQueryStore,
  QueryType,
} from "./query-store";
import { api } from "@residency/api";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { FullApplicantType } from "@residency/api";

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

// Filter function moved here to ensure it's stable
const filterApplicants = (
  applicants: FullApplicantType[],
  searchTerm: string
): FullApplicantType[] => {
  if (!searchTerm.trim()) return applicants;

  const search = searchTerm.toLowerCase();

  return applicants.filter((result) => {
    const applicant = result.applicant;

    const searchableFields = [
      // Basic info
      applicant.basicInfo.firstName,
      applicant.basicInfo.lastName,
      applicant.basicInfo.email,
      applicant.basicInfo.phoneNumber,
      // Background info
      applicant.background.country,
      applicant.background.gender,
      applicant.background.college,
      applicant.background.referrals,
      // Mission info
      applicant.mission.interest,
      applicant.mission.accomplishment,
      // Links
      applicant.links?.linkedin,
      applicant.links?.github,
      applicant.links?.website,
      applicant.links?.twitter,
    ].filter(Boolean); // Remove null/undefined values

    return searchableFields.some((field) =>
      field?.toLowerCase().includes(search)
    );
  });
};

export const useApplicantQuery = (queryType: QueryType) => {
  // Get raw query data with stable reference
  const query = useApplicantStore((state) => state.queries[queryType]);

  // Get search term separately
  const searchTerm = useApplicantStore((state) => state.searchTerm);

  // Memoize filtered results to avoid recreating on every render
  const filteredResults = useMemo(() => {
    return filterApplicants(query.results, searchTerm);
  }, [query.results, searchTerm]);

  // Return stable object with memoized results
  return useMemo(
    () => ({
      results: filteredResults,
      status: query.status,
      loadMore: query.loadMore,
    }),
    [filteredResults, query.status, query.loadMore]
  );
};
