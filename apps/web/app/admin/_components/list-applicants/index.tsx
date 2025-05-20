"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Button } from "@residency/ui/components/button";
import { api } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import { ApplicantCard } from "./applicant-card";
import { Card, CardContent } from "@residency/ui/components/card";
import { Skeleton } from "@residency/ui/components/skeleton";

const useApplicantList = () => {
  const {
    results: applicants,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.application.admin.listApplicants,
    {
      paginationOpts: {
        numItems: 10,
      },
    },
    { initialNumItems: 10 }
  );

  return { applicants, status, loadMore };
};

export type ApplicantListQuery = ReturnType<typeof useApplicantList>;
export type Applicant = ApplicantListQuery["applicants"][number];

export const ApplicantList = () => {
  const applicantsQuery = useApplicantList();

  const content =
    applicantsQuery.status === "LoadingFirstPage" ? (
      <ListSkeleton />
    ) : (
      <ListContent applicantsQuery={applicantsQuery} />
    );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="applicants">
        <AccordionTrigger className="text-lg font-medium lowercase">
          applicants summer 2025
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">{content}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface ListContentProps {
  applicantsQuery: ApplicantListQuery;
}

const ListContent = ({ applicantsQuery }: ListContentProps) => {
  const { applicants, status, loadMore } = applicantsQuery;

  return (
    <>
      {applicants.map((applicant) => (
        <ApplicantCard key={applicant.id as string} applicant={applicant} />
      ))}
      {status !== "Exhausted" && (
        <div className="flex justify-start mt-6">
          <Button
            variant="outline"
            onClick={() => loadMore(10)}
            disabled={status === "LoadingMore"}
          >
            {status === "LoadingMore" ? "loading..." : "load more"}
          </Button>
        </div>
      )}
    </>
  );
};

export const ListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-[180px]" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
