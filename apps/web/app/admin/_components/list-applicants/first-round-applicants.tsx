"use client";

import { api, FirstRoundApplicantType } from "@residency/api";
import { usePaginatedQuery } from "convex/react";
import { Separator } from "@residency/ui/components/separator";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Accordion } from "@residency/ui/components/accordion";
import {
  BackgroundSection,
  CardWrapper,
  HeaderSection,
  InterviewSection,
  LinksSection,
  ListWrapper,
  MissionSection,
} from "./list-helpers";

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

export const FirstRoundApplicants = () => {
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
  result: FirstRoundApplicantType;
}
const FirstRoundCard = ({ result }: FirstRoundCardProps) => {
  const { applicant, interview } = result;

  return (
    <CardWrapper>
      <div className="flex flex-col space-y-2">
        <HeaderSection basicInfo={applicant.basicInfo} id={applicant.id} />
        <InterviewSection interview={interview} />
      </div>
      <Separator className="mt-2" />
      <AdditionalSection applicant={applicant} />
    </CardWrapper>
  );
};

interface AdditionalSectionProps {
  applicant: FirstRoundApplicantType["applicant"];
}
const AdditionalSection = ({ applicant }: AdditionalSectionProps) => {
  const { background, mission, links } = applicant;

  return (
    <Accordion
      type="single"
      collapsible
      className="text-sm text-muted-foreground"
    >
      <AccordionItem value="background">
        <AccordionTrigger>additional info</AccordionTrigger>
        <AccordionContent className="space-y-3 p-0">
          <BackgroundSection background={background} />
          <MissionSection mission={mission} />
          <LinksSection links={links} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
