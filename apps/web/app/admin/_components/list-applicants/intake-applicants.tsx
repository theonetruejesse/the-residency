"use client";

import { Card, CardContent } from "@residency/ui/components/card";
import { Badge } from "@residency/ui/components/badge";
import { useState } from "react";
import {
  GithubSvg,
  LinkedinSvg,
  TwitterSvg,
  WebsiteSvg,
} from "@/components/social-svgs";
import { Button } from "@residency/ui/components/button";
import { api } from "@residency/api";
import { useAction, usePaginatedQuery } from "convex/react";
import { ListSkeleton } from "./list-skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { ChevronRight } from "lucide-react";

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

type IntakeApplicantsQuery = ReturnType<typeof useIntakeList>;
type IntakeApplicant = Awaited<
  IntakeApplicantsQuery["applicants"][number]
>[][number];

export const IntakeApplicants = () => {
  const applicantsQuery = useIntakeList();

  const content =
    applicantsQuery.status === "LoadingFirstPage" ? (
      <ListSkeleton />
    ) : (
      <ListContent applicantsQuery={applicantsQuery} />
    );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-medium">intake round</h1>
      {content}
    </div>
  );
};

interface ListContentProps {
  applicantsQuery: IntakeApplicantsQuery;
}

const ListContent = ({ applicantsQuery }: ListContentProps) => {
  const { applicants, status, loadMore } = applicantsQuery;

  return (
    <>
      {applicants.map((applicant) => (
        <ApplicantCard key={applicant.id as string} applicant={applicant} />
      ))}
      {status !== "Exhausted" && (
        <div className="flex justify-start mt-6">
          <Button
            variant="outline"
            onClick={() => loadMore(10)}
            disabled={status === "LoadingMore"}
          >
            {status === "LoadingMore" ? "loading..." : "load more"}
          </Button>
        </div>
      )}
    </>
  );
};

interface ApplicantCardProps {
  applicant: IntakeApplicant;
}

export const ApplicantCard = ({ applicant }: ApplicantCardProps) => {
  return (
    <Card className="w-lg">
      <CardContent className="px-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium lowercase flex items-center gap-4">
              {applicant.basicInfo.firstName} {applicant.basicInfo.lastName}
            </h3>
            <FirstRoundDecision applicantId={applicant.id} />
          </div>

          <BackgroundSection background={applicant.background} />
          <MissionSection mission={applicant.mission} />
          <LinksSection links={applicant.links} />
        </div>
      </CardContent>
    </Card>
  );
};

// SECTIONS

interface BackgroundSectionProps {
  background: IntakeApplicant["background"];
}
const BackgroundSection = ({ background }: BackgroundSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { country, gender, college, referrals } = background;

  return (
    <div className="border-t border-b py-1.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex text-sm text-muted-foreground w-full lowercase text-sm"
      >
        <span className="mr-1">{isExpanded ? "[-]" : "[+]"}</span>
        {isExpanded ? (
          <span className="flex flex-row gap-2">
            {referrals && (
              <Badge
                variant="outline"
                className="bg-slate-100 lowercase px-1 py-0"
              >
                referred by: {referrals}
              </Badge>
            )}
            {`${country}, ${gender}${college ? `, ${college}` : ""}`}
          </span>
        ) : (
          "show details"
        )}
      </button>
    </div>
  );
};

const MissionSection = ({
  mission,
}: {
  mission: IntakeApplicant["mission"];
}) => {
  return (
    <div className="space-y-2 lowercase">
      <div>
        <span className="font-bold">interests: </span>
        <span>{mission.interest}</span>
      </div>
      <div>
        <span className="font-bold">accomplishments: </span>
        <span>{mission.accomplishment}</span>
      </div>
    </div>
  );
};

const LinksSection = ({ links }: { links: IntakeApplicant["links"] }) => {
  const { twitter, linkedin, github, website } = links;
  return (
    <div className="flex items-center gap-3">
      <LinkIcon link={twitter} Svg={TwitterSvg} />
      <LinkIcon link={linkedin} Svg={LinkedinSvg} />
      <LinkIcon link={github} Svg={GithubSvg} />
      <LinkIcon link={website} Svg={WebsiteSvg} />
    </div>
  );
};

interface LinkIconProps {
  link: string | undefined;
  Svg: React.FC<React.SVGProps<SVGSVGElement>>;
}

const LinkIcon = ({ link, Svg }: LinkIconProps) => {
  if (!link) return null;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <span className="inline-block">
        <Svg />
      </span>
    </a>
  );
};

// DECISIONS

type FirstRoundActions = "approve" | "waitlist" | "reject";

const useFirstRoundDecision = (applicantId: IntakeApplicant["id"]) => {
  const approveIntake = useAction(api.application.admin.approveIntake);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (decision: FirstRoundActions) => {
    try {
      setIsSubmitting(true);

      switch (decision) {
        case "approve":
          await approveIntake({ applicantId });
          break;
        case "waitlist":
          await waitlistApplicant({ applicantId });
          break;
        case "reject":
          await rejectApplicant({ applicantId });
          break;
      }
    } catch (error) {
      console.error("Error updating applicant status:", error);
      // Potentially set an error state here to display to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleAction, isSubmitting };
};

interface ApplicantDecisionProps {
  applicantId: IntakeApplicant["id"];
}
const FirstRoundDecision = ({ applicantId }: ApplicantDecisionProps) => {
  type Decision = FirstRoundActions | "pending";
  const [decision, setDecision] = useState<Decision>("pending");
  const { handleAction, isSubmitting } = useFirstRoundDecision(applicantId);

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue="pending"
        onValueChange={(value) => setDecision(value as Decision)}
      >
        <SelectTrigger className="w-[120px] h-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">pending</SelectItem>
          <SelectItem value="approve">approve</SelectItem>
          <SelectItem value="waitlist">waitlist</SelectItem>
          <SelectItem value="reject">reject</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="icon"
        disabled={isSubmitting || decision === "pending"}
        onClick={() => handleAction(decision as FirstRoundActions)}
        className="lowercase"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
