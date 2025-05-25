"use client";

import { api } from "@residency/api";
import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  BackgroundSection,
  LinksSection,
  MissionSection,
} from "./section-content";
import { HeaderSection } from "./section-header";
import {
  FooterWrapper,
  CardWrapper,
  InterviewWrapper,
  ListWrapper,
  AdditionalWrapper,
} from "./card-wrappers";
import { ScoreTable } from "./section-grade";
import { NotesSection } from "./section-notes";

const useSecondRoundList = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.application.admin.secondRoundApplicants,
    {
      paginationOpts: {
        numItems: 10,
      },
    },
    { initialNumItems: 10 }
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
      <HeaderSection applicant={applicant} />
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

interface ScoreSectionProps {
  interview: FullApplicantType["interview"];
}
const ScoreSection = ({ interview }: ScoreSectionProps) => {
  return (
    <InterviewWrapper interview={interview}>
      <ScoreTable interview={interview as InterviewGrade} />
    </InterviewWrapper>
  );
};

// const ScoreSection;
