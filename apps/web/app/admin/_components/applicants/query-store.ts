import { FullApplicantType } from "@residency/api";

export type ConvexQueryResult = {
  results: FullApplicantType[];
  status: "LoadingFirstPage" | "CanLoadMore" | "Exhausted" | "LoadingMore";
  loadMore: (numItems: number) => void;
};

export type QueryType =
  | "intake"
  | "firstRound"
  | "secondRound"
  | "accepted"
  | "rejected"
  | "waitlisted";

export interface ApplicantQueryStore {
  //   rawData: Record<QueryType, FullApplicantType[]>; // will use for search filtering
  queries: Record<QueryType, ConvexQueryResult>;
  setQueryResults: (queryType: QueryType, result: ConvexQueryResult) => void;
}

import { createStore } from "zustand";

const initialQueryState: ConvexQueryResult = {
  results: [],
  status: "Exhausted",
  loadMore: () => {},
};

export const createApplicantQueryStore = () =>
  createStore<ApplicantQueryStore>((set, get) => ({
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
  }));
