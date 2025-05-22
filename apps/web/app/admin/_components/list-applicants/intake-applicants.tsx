"use client";

import { api, type FullApplicantType } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import {
  BackgroundSection,
  CardWrapper,
  HeaderSection,
  LinksSection,
  ListWrapper,
  MissionSection,
} from "./list-helpers";

export const IntakeApplicants = () => {
  const { applicants, status, loadMore } = useIntakeList();

  return (
    <ListWrapper status={status} loadMore={loadMore} title="intake round">
      {applicants.map((applicant) => (
        <IntakeCard key={applicant.id as string} applicant={applicant} />
      ))}
    </ListWrapper>
  );
};

interface IntakeCardProps {
  applicant: FullApplicantType;
}

export const IntakeCard = ({ applicant }: IntakeCardProps) => {
  const { basicInfo, background, mission, links } = applicant;

  return (
    <CardWrapper>
      <HeaderSection basicInfo={basicInfo} id={applicant.id} />
      <BackgroundSection background={background} />
      <MissionSection mission={mission} />
      <LinksSection links={links} />
    </CardWrapper>
  );
};

const useIntakeList = () => {
  const {
    results: applicants,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.application.admin.intakeApplicants,
    {
      paginationOpts: {
        numItems: 10,
      },
    },
    { initialNumItems: 10 }
  );

  return { applicants, status, loadMore };
};
