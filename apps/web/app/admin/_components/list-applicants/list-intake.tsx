"use client";

import { api } from "@residency/api";
import type { FullApplicantType } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  BackgroundSection,
  CardWrapper,
  HeaderSection,
  LinksSection,
  ListWrapper,
  MissionSection,
} from "./helpers-list";

const useIntakeList = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.application.admin.intakeApplicants,
    {
      paginationOpts: {
        numItems: 10,
      },
    },
    { initialNumItems: 10 }
  );

  return { results, status, loadMore };
};

export const ListIntake = () => {
  const { results, status, loadMore } = useIntakeList();

  return (
    <ListWrapper status={status} loadMore={loadMore} title="intake round">
      {results.map((result) => (
        <IntakeCard key={result.applicant.id as string} result={result} />
      ))}
    </ListWrapper>
  );
};

interface IntakeCardProps {
  result: FullApplicantType;
}

const IntakeCard = ({ result }: IntakeCardProps) => {
  const { basicInfo, background, mission, links } = result.applicant;

  return (
    <CardWrapper>
      <HeaderSection basicInfo={basicInfo} id={result.applicant.id} />
      <BackgroundSection background={background} />
      <MissionSection mission={mission} />
      <LinksSection links={links} />
    </CardWrapper>
  );
};
