"use client";

import { type FullApplicantType } from "@residency/api";
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
  DisplayWrapper,
} from "./helper-wrappers";
import { NotesSection } from "./section-notes";
import { useApplicantQuery } from "./query-hooks";
import { GradesSection, ScoreSection } from "./section-interview";

export const DisplayPending = () => {
  return (
    <DisplayWrapper>
      <ListIntake />
      <ListFirstRound />
      <ListSecondRound />
    </DisplayWrapper>
  );
};

const ListIntake = () => {
  const { results, status, loadMore, totalCount } = useApplicantQuery("intake");
  return (
    <ListWrapper
      status={status}
      loadMore={loadMore}
      title={`intake round (${totalCount})`}
    >
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
      <FooterWrapper>
        <AdditionalWrapper title="notes">
          <NotesSection notes={result.notes} applicantId={id} />
        </AdditionalWrapper>
      </FooterWrapper>
    </CardWrapper>
  );
};

const ListFirstRound = () => {
  const { results, status, loadMore, totalCount } =
    useApplicantQuery("firstRound");

  return (
    <ListWrapper
      status={status}
      loadMore={loadMore}
      title={`first round (${totalCount})`}
    >
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
  const { applicant, notes, interview } = result;

  return (
    <CardWrapper>
      <PendingHeaderSection applicant={applicant} />
      <GradesSection interview={interview} />
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
    </CardWrapper>
  );
};

const ListSecondRound = () => {
  const { results, status, loadMore, totalCount } =
    useApplicantQuery("secondRound");

  return (
    <ListWrapper
      status={status}
      loadMore={loadMore}
      title={`second round (${totalCount})`}
    >
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
  const { applicant, notes, interview } = result;

  return (
    <CardWrapper>
      <PendingHeaderSection applicant={applicant} />
      <NotesSection notes={notes} applicantId={applicant.id} />
      <FooterWrapper>
        <AdditionalWrapper title="applicant info">
          <ScoreSection interview={interview} />
          <BackgroundSection background={applicant.background} />
          <MissionSection mission={applicant.mission} />
          <LinksSection links={applicant.links} />
        </AdditionalWrapper>
      </FooterWrapper>
    </CardWrapper>
  );
};
