"use client";

import { type FullApplicantType } from "@residency/api";
import {
  BackgroundSection,
  LinksSection,
  MissionSection,
} from "./section-content";
import { PendingHeaderSection } from "./section-header";
import {
  FooterWrapper,
  CardWrapper,
  ListWrapper,
  AdditionalWrapper,
} from "./helper-wrappers";
import { ScoreSection } from "./section-interview";
import { NotesSection } from "./section-notes";
import { useApplicantQuery, useListTitle } from "./query-hooks";

export const ListSecondRound = () => {
  const { results, status, loadMore } = useApplicantQuery("secondRound");
  const title = useListTitle("second_round");

  return (
    <ListWrapper status={status} loadMore={loadMore} title={title}>
      {results.map((result) => (
        <SecondRoundCard key={result.applicant.id as string} result={result} />
      ))}
    </ListWrapper>
  );
};

interface SecondRoundCardProps {
  result: FullApplicantType;
}
const SecondRoundCard = ({ result }: SecondRoundCardProps) => {
  const { applicant, notes } = result;

  return (
    <CardWrapper>
      <PendingHeaderSection applicant={applicant} />
      <NotesSection notes={notes} applicantId={applicant.id} />
      <AdditionalSection result={result} />
    </CardWrapper>
  );
};

const AdditionalSection = ({ result }: SecondRoundCardProps) => {
  const { applicant, interview } = result;

  return (
    <FooterWrapper>
      <AdditionalWrapper title="applicant info">
        <ScoreSection interview={interview} />
        <BackgroundSection background={applicant.background} />
        <MissionSection mission={applicant.mission} />
        <LinksSection links={applicant.links} />
      </AdditionalWrapper>
    </FooterWrapper>
  );
};
