import { api, type FullApplicantType } from "@residency/api";
import { useMemo } from "react";
import { useApplicantStore } from "./query-provider";
import { QueryType } from "./query-store";
import { useQuery } from "convex/react";

// a bit inefficent, and desynced but i am done
type ListTitles =
  | "intake"
  | "first_round"
  | "second_round"
  | "waitlisted"
  | "accepted"
  | "rejected";

export const useListTitle = (opt: ListTitles) => {
  const count = useQuery(api.application.admin.totalCount, {
    opt,
  });
  const displayCount = count ? ` (${count})` : "";

  switch (opt) {
    case "intake":
      return `intake round${displayCount}`;
    case "first_round":
      return `first round${displayCount}`;
    case "second_round":
      return `second round${displayCount}`;
    case "waitlisted":
      return `waitlisted${displayCount}`;
    case "accepted":
      return `accepted${displayCount}`;
    case "rejected":
      return `rejected${displayCount}`;
  }
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
