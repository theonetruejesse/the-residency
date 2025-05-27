import { type FullApplicantType } from "@residency/api";
import { useMemo, useState, useEffect } from "react";
import { useApplicantStore } from "./query-provider";
import { QueryType } from "./query-store";

// we debounce the search which helps prevent laggy ui when typing
export const useSearch = () => {
  const searchTerm = useApplicantStore((state) => state.searchTerm);
  const setSearchTerm = useApplicantStore((state) => state.setSearchTerm);
  const clearSearch = useApplicantStore((state) => state.clearSearch);

  // Local state for immediate input updates
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    clearSearch();
  };

  // Debounced effect to update the store search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 100); // 100ms delay

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, setSearchTerm]);

  // Sync local state when store search term is cleared externally
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  return {
    searchTerm: localSearchTerm,
    setSearchTerm: setLocalSearchTerm,
    clearSearch: handleClearSearch,
  };
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
      totalCount: query.totalCount,
    }),
    [filteredResults, query.status, query.loadMore, query.totalCount]
  );
};
