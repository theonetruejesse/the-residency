"use client";

import { api, FullApplicantType } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { useAction } from "convex/react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Id } from "@residency/api";
import { Badge } from "@residency/ui/components/badge";
import {
  TwitterSvg,
  LinkedinSvg,
  GithubSvg,
  WebsiteSvg,
} from "@/components/social-svgs";
import { Card, CardContent } from "@residency/ui/components/card";
import { Skeleton } from "@residency/ui/components/skeleton";

// WRAPPERS

export const CardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="w-lg">
      <CardContent className="px-6 flex flex-col space-y-3">
        {children}
      </CardContent>
    </Card>
  );
};

interface ListWrapperProps {
  children: React.ReactNode;
  status: "LoadingFirstPage" | "LoadingMore" | "Exhausted" | "CanLoadMore";
  loadMore: (numItems: number) => void;
  title: string;
}
export const ListWrapper = ({
  children,
  status,
  loadMore,
  title,
}: ListWrapperProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-medium">{title}</h1>
      {status !== "LoadingFirstPage" ? (
        <>
          {children}
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
      ) : (
        <ListSkeleton />
      )}
    </div>
  );
};

const ListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <CardWrapper key={i}>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardWrapper>
      ))}
    </div>
  );
};

// HEADER SECTION

interface HeaderSectionProps {
  basicInfo: FullApplicantType["basicInfo"];
  id: Id<"applicants">;
}
export const HeaderSection = ({ basicInfo, id }: HeaderSectionProps) => {
  const { firstName, lastName } = basicInfo;

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium lowercase flex items-center gap-4">
        {`${firstName} ${lastName}`}
      </h3>
      <ApplicantDecision applicantId={id} />
    </div>
  );
};

type DecisionActions = "approve" | "waitlist" | "reject";

const useFirstRoundDecision = (applicantId: Id<"applicants">) => {
  const approveRound = useAction(api.application.admin.approveRound);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (decision: DecisionActions) => {
    try {
      setIsSubmitting(true);

      switch (decision) {
        case "approve":
          await approveRound({ applicantId });
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
  applicantId: Id<"applicants">;
}
const ApplicantDecision = ({ applicantId }: ApplicantDecisionProps) => {
  type Decision = DecisionActions | "pending";
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
        onClick={() => handleAction(decision as DecisionActions)}
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

// BODY SECTIONS

interface BackgroundSectionProps {
  background: FullApplicantType["background"];
}
export const BackgroundSection = ({ background }: BackgroundSectionProps) => {
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

interface MissionSectionProps {
  mission: FullApplicantType["mission"];
}
export const MissionSection = ({ mission }: MissionSectionProps) => {
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

interface LinksSectionProps {
  links: FullApplicantType["links"];
}
export const LinksSection = ({ links }: LinksSectionProps) => {
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
