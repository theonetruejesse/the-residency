"use client";

import { usePaginatedQuery } from "convex/react";
import { api, FullApplicantType } from "@residency/api";
import {
  AdditionalWrapper,
  CardWrapper,
  KanbanWrapper,
  ListWrapper,
} from "./wrappers";
import {
  BackgroundSection,
  MissionSection,
  LinksSection,
} from "./section-content";
import { ScoreSection } from "./section-interview";
import { NotesSection } from "./section-notes";
import { PAGINATION_CONFIG } from "../config";
import { DoneHeaderSection } from "./section-header";

const useDone = () => {
  const rejected = usePaginatedQuery(
    api.application.admin.rejectedApplicants,
    ...PAGINATION_CONFIG
  );

  const waitlisted = usePaginatedQuery(
    api.application.admin.waitlistedApplicants,
    ...PAGINATION_CONFIG
  );

  const accepted = usePaginatedQuery(
    api.application.admin.acceptedApplicants,
    ...PAGINATION_CONFIG
  );

  return { rejected, waitlisted, accepted };
};

export const DisplayDone = () => {
  const { waitlisted, rejected, accepted } = useDone();
  return (
    <div>
      <KanbanWrapper>
        <ListDone query={accepted} title="accepted" />
        <ListDone query={waitlisted} title="waitlisted" />
        <ListDone query={rejected} title="rejected" />
      </KanbanWrapper>
    </div>
  );
};

interface ListDoneProps {
  title: string;
  query: ReturnType<typeof useDone>[keyof ReturnType<typeof useDone>];
}
export const ListDone = ({ query, title }: ListDoneProps) => {
  const { results, status, loadMore } = query;

  return (
    <ListWrapper status={status} loadMore={loadMore} title={title}>
      {results.map((result) => (
        <DoneCard key={result.applicant.id} result={result} />
      ))}
    </ListWrapper>
  );
};

interface DoneCardProps {
  result: FullApplicantType;
}
const DoneCard = ({ result }: DoneCardProps) => {
  const { applicant, interview, notes } = result;
  const { background, mission, links } = applicant;

  return (
    <CardWrapper>
      <DoneHeaderSection applicant={applicant} />
      <AdditionalWrapper title="applicant info">
        <ScoreSection interview={interview} />
        <BackgroundSection background={background} />
        <MissionSection mission={mission} />
        <LinksSection links={links} />
      </AdditionalWrapper>
      <AdditionalWrapper title="notes">
        <NotesSection notes={notes} applicantId={applicant.id} />
      </AdditionalWrapper>
    </CardWrapper>
  );
};
