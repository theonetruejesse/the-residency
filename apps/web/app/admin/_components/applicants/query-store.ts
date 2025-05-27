import { createStore } from "zustand";
import type { FullApplicantType } from "@residency/api";

export type QueryResult = {
  results: FullApplicantType[];
  status: "LoadingFirstPage" | "CanLoadMore" | "Exhausted" | "LoadingMore";
  loadMore: (numItems: number) => void;
  totalCount: number;
};

export type QueryType =
  | "intake"
  | "firstRound"
  | "secondRound"
  | "accepted"
  | "rejected"
  | "waitlisted";

export interface ApplicantQueryStore {
  // Query data
  queries: Record<QueryType, QueryResult>;
  setQueryResults: (queryType: QueryType, result: QueryResult) => void;

  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

const initialQueryState: QueryResult = {
  results: [],
  status: "Exhausted",
  loadMore: () => {},
  totalCount: 0,
};

export const createApplicantQueryStore = () =>
  createStore<ApplicantQueryStore>((set, get) => ({
    searchTerm: "",
    queries: {
      intake: initialQueryState,
      firstRound: initialQueryState,
      secondRound: initialQueryState,
      accepted: initialQueryState,
      rejected: initialQueryState,
      waitlisted: initialQueryState,
    },
    setQueryResults: (queryType, result) =>
      set((state) => ({
        queries: {
          ...state.queries,
          [queryType]: {
            ...state.queries[queryType],
            ...result,
          },
        },
      })),

    setSearchTerm: (term) => set({ searchTerm: term }),
    clearSearch: () => set({ searchTerm: "" }),
  }));
