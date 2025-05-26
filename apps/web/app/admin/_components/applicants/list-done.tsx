"use client";

import {
  KanbanWrapper,
  CardWrapper,
  AdditionalWrapper,
  ListWrapper,
} from "./helper-wrappers";
import {
  BackgroundSection,
  MissionSection,
  LinksSection,
} from "./section-content";
import { ScoreSection } from "./section-interview";
import { NotesSection } from "./section-notes";
import { DoneHeaderSection } from "./section-header";
import { useApplicantQuery } from "./query-provider";
import { type ConvexQueryResult } from "./query-store";
import type { FullApplicantType } from "@residency/api";

export const DisplayDone = () => {
  const accepted = useApplicantQuery("accepted");
  const waitlisted = useApplicantQuery("waitlisted");
  const rejected = useApplicantQuery("rejected");

  return (
    <KanbanWrapper>
      <ListDone query={accepted} title="accepted" />
      <ListDone query={waitlisted} title="waitlisted" />
      <ListDone query={rejected} title="rejected" />
    </KanbanWrapper>
  );
};

interface ListDoneProps {
  title: string;
  query: ConvexQueryResult;
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
