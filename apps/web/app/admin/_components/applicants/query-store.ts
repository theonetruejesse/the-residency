import { createStore } from "zustand";
import type { FullApplicantType } from "@residency/api";
import type { CriteriaWeights } from "../redis-criteria";

export type QueryType =
  | "intake"
  | "firstRound"
  | "secondRound"
  | "accepted"
  | "rejected"
  | "waitlisted";

export type QueryResult = {
  results: FullApplicantType[];
  status: "LoadingFirstPage" | "CanLoadMore" | "Exhausted" | "LoadingMore";
  loadMore: (numItems: number) => void;
  totalCount: number;
};

export interface ApplicantQueryStore {
  // Query data
  queries: Record<QueryType, QueryResult>;
  setQueryResults: (queryType: QueryType, result: QueryResult) => void;

  // Criteria weights
  criterias: CriteriaWeights;
  setCriterias: (criterias: CriteriaWeights) => void;

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

const DEFAULT_QUERIES = {
  intake: initialQueryState,
  firstRound: initialQueryState,
  secondRound: initialQueryState,
  accepted: initialQueryState,
  rejected: initialQueryState,
  waitlisted: initialQueryState,
};

export const createApplicantQueryStore = (criterias: CriteriaWeights) =>
  createStore<ApplicantQueryStore>((set, get) => ({
    criterias,
    setCriterias: (criterias) => set({ criterias }),

    queries: DEFAULT_QUERIES,
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

    searchTerm: "",
    setSearchTerm: (term) => set({ searchTerm: term }),
    clearSearch: () => set({ searchTerm: "" }),
  }));
