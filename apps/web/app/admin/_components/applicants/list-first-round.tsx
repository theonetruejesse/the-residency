"use client";

import type { FullApplicantType } from "@residency/api";
import {
  BackgroundSection,
  LinksSection,
  MissionSection,
} from "./section-content";
import { GradesSection } from "./section-interview";
import {
  FooterWrapper,
  CardWrapper,
  ListWrapper,
  AdditionalWrapper,
} from "./helper-wrappers";
import { PendingHeaderSection } from "./section-header";
import { NotesSection } from "./section-notes";
import { useApplicantQuery, useListTitle } from "./query-hooks";

export const ListFirstRound = () => {
  const { results, status, loadMore } = useApplicantQuery("firstRound");
  const title = useListTitle("first_round");

  return (
    <ListWrapper status={status} loadMore={loadMore} title={title}>
      {results.map((result) => (
        <FirstRoundCard key={result.applicant.id as string} result={result} />
      ))}
    </ListWrapper>
  );
};

interface FirstRoundCardProps {
  result: FullApplicantType;
}
const FirstRoundCard = ({ result }: FirstRoundCardProps) => {
  const { applicant, notes, interview } = result;

  return (
    <CardWrapper>
      <PendingHeaderSection applicant={applicant} />
      <GradesSection interview={interview} />
      <AdditionalSection applicant={applicant} notes={notes} />
    </CardWrapper>
  );
};

interface AdditionalSectionProps {
  applicant: FullApplicantType["applicant"];
  notes: FullApplicantType["notes"];
}
const AdditionalSection = ({ applicant, notes }: AdditionalSectionProps) => {
  return (
    <FooterWrapper>
      <AdditionalWrapper title="applicant info">
        <BackgroundSection background={applicant.background} />
        <MissionSection mission={applicant.mission} />
        <LinksSection links={applicant.links} />
      </AdditionalWrapper>
      <AdditionalWrapper title="notes">
        <NotesSection notes={notes} applicantId={applicant.id} />
      </AdditionalWrapper>
    </FooterWrapper>
  );
};
