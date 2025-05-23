"use client";

import { api } from "@residency/api";
import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  AdditionalWrapper,
  BackgroundSection,
  CardWrapper,
  GradesSection,
  HeaderSection,
  InterviewWrapper,
  LinksSection,
  ListWrapper,
  MissionSection,
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

export const ListFirstRound = () => {
  const { results, status, loadMore } = useFirstRoundList();

  return (
    <ListWrapper status={status} loadMore={loadMore} title="first round">
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
  const { applicant, interview } = result;

  return (
    <CardWrapper>
      <div className="flex flex-col space-y-2">
        <HeaderSection basicInfo={applicant.basicInfo} id={applicant.id} />
        <InterviewSection interview={interview} />
      </div>
      <AdditionalSection applicant={applicant} />
    </CardWrapper>
  );
};

interface InterviewSectionProps {
  interview: FullApplicantType["interview"];
}
const InterviewSection = ({ interview }: InterviewSectionProps) => {
  return (
    <InterviewWrapper interview={interview}>
      <GradesSection interview={interview as InterviewGrade} />
    </InterviewWrapper>
  );
};

interface AdditionalSectionProps {
  applicant: FullApplicantType["applicant"];
}
const AdditionalSection = ({ applicant }: AdditionalSectionProps) => {
  return (
    <AdditionalWrapper>
      <BackgroundSection background={applicant.background} />
      <MissionSection mission={applicant.mission} />
      <LinksSection links={applicant.links} />
    </AdditionalWrapper>
  );
};
