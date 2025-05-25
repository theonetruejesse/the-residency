"use client";

import { api } from "@residency/api";
import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  BackgroundSection,
  LinksSection,
  MissionSection,
} from "./section-content";
import { GradesSection } from "./section-grade";
import {
  FooterWrapper,
  CardWrapper,
  InterviewWrapper,
  ListWrapper,
  AdditionalWrapper,
} from "./card-wrappers";
import { HeaderSection } from "./section-header";
import { NotesSection } from "./section-notes";

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
  const { applicant, interview, notes } = result;

  return (
    <CardWrapper>
      <HeaderSection applicant={applicant} />
      <InterviewSection interview={interview} />
      <AdditionalSection applicant={applicant} notes={notes} />
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
