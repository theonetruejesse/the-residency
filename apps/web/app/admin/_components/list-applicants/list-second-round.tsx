"use client";

import { api } from "@residency/api";
import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  AdditionalWrapper,
  BackgroundSection,
  CardWrapper,
  HeaderSection,
  InterviewWrapper,
  LinksSection,
  ListWrapper,
  MissionSection,
  ScoreTable,
} from "./helpers-list";

const useFirstRoundList = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.application.admin.firstRoundApplicants,
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
  const { results, status, loadMore } = useFirstRoundList();

  return (
    <ListWrapper status={status} loadMore={loadMore} title="second round">
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
  const { applicant } = result;

  return (
    <CardWrapper>
      <div className="flex flex-col space-y-2">
        <HeaderSection basicInfo={applicant.basicInfo} id={applicant.id} />
      </div>
      <AdditionalSection result={result} />
    </CardWrapper>
  );
};

const AdditionalSection = ({ result }: FirstRoundCardProps) => {
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
