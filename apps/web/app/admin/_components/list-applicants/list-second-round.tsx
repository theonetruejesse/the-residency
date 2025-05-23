"use client";

import { api } from "@residency/api";
import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import {
  AdditionalWrapper,
  BackgroundSection,
  CardWrapper,
  HeaderSection,
  InterviewWrapper,
  LinksSection,
  ListWrapper,
  MissionSection,
  RankingSection,
  ScoreTable,
} from "./helpers-list";

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
  const { applicant } = result;

  return (
    <CardWrapper>
      <HeaderSection basicInfo={applicant.basicInfo} id={applicant.id} />
      <RankingSection
        applicantId={applicant.id}
        applicantRanking={applicant.decision.ranking}
      />
      <AdditionalSection result={result} />
    </CardWrapper>
  );
};

const AdditionalSection = ({ result }: SecondRoundCardProps) => {
  const { applicant, interview } = result;

  return (
    <AdditionalWrapper>
      <ScoreSection interview={interview} />
      <BackgroundSection background={applicant.background} />
      <MissionSection mission={applicant.mission} />
      <LinksSection links={applicant.links} />
    </AdditionalWrapper>
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
