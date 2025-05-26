"use client";

import type { FullApplicantType, Id } from "@residency/api";
import {
  BackgroundSection,
  LinksSection,
  MissionSection,
} from "./section-content";
import { PendingHeaderSection } from "./section-header";
import {
  ListWrapper,
  CardWrapper,
  FooterWrapper,
  AdditionalWrapper,
} from "./helper-wrappers";
import { NotesSection } from "./section-notes";
import { useApplicantStore } from "./query-provider";

export const ListIntake = () => {
  const { results, status, loadMore } = useApplicantStore(
    (state) => state.queries.intake
  );

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
  const { background, mission, links, id } = result.applicant;

  return (
    <CardWrapper>
      <PendingHeaderSection applicant={result.applicant} />
      <BackgroundSection background={background} />
      <MissionSection mission={mission} />
      <LinksSection links={links} />
      <AdditionalSection applicantId={id} notes={result.notes} />
    </CardWrapper>
  );
};

interface AdditionalSectionProps {
  applicantId: Id<"applicants">;
  notes: FullApplicantType["notes"];
}
const AdditionalSection = ({ applicantId, notes }: AdditionalSectionProps) => {
  return (
    <FooterWrapper>
      <AdditionalWrapper title="notes">
        <NotesSection notes={notes} applicantId={applicantId} />
      </AdditionalWrapper>
    </FooterWrapper>
  );
};
