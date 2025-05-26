"use client";

import { api } from "@residency/api";
import type { FullApplicantType } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
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
import { PAGINATION_CONFIG } from "../config";

const useSecondRoundList = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.application.admin.secondRoundApplicants,
    ...PAGINATION_CONFIG
  );

  return { results, status, loadMore };
};

export const ListSecondRound = () => {
  const { results, status, loadMore } = useSecondRoundList();

  return (
    <ListWrapper status={status} loadMore={loadMore} title="second round">
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
