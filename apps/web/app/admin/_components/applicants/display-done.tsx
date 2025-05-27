"use client";

import {
  DisplayWrapper,
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
import { useApplicantQuery } from "./query-hooks";
import { type QueryResult } from "./query-store";
import type { FullApplicantType } from "@residency/api";

export const DisplayDone = () => {
  const a = useApplicantQuery("accepted");
  const w = useApplicantQuery("waitlisted");
  const r = useApplicantQuery("rejected");

  return (
    <DisplayWrapper>
      <ListDone query={a} title={`accepted (${a.totalCount})`} />
      <ListDone query={w} title={`waitlisted (${w.totalCount})`} />
      <ListDone query={r} title={`rejected (${r.totalCount})`} />
    </DisplayWrapper>
  );
};

interface ListDoneProps {
  title: string;
  query: QueryResult;
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
