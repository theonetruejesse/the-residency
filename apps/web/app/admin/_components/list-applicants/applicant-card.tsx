import { Card, CardContent } from "@residency/ui/components/card";

import { Badge } from "@residency/ui/components/badge";
import { useState } from "react";
import type { Applicant } from ".";
import {
  GithubSvg,
  LinkedinSvg,
  TwitterSvg,
  WebsiteSvg,
} from "@/components/social-svgs";
import { FirstRoundDecision } from "./decision-button";

interface ApplicantCardProps {
  applicant: Applicant;
}

export const ApplicantCard = ({ applicant }: ApplicantCardProps) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="px-6">
        <div className="flex flex-col space-y-4">
          {/* Header section with name, referral, select and button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium lowercase">
                {applicant.basicInfo.firstName} {applicant.basicInfo.lastName}
              </h3>
              {/* <Badge
                variant="outline"
                className={`lowercase ${
                  applicant.decision.status === "pending"
                    ? "bg-yellow-100"
                    : applicant.decision.status === "accepted"
                      ? "bg-green-100"
                      : applicant.decision.status === "rejected"
                        ? "bg-red-100"
                        : "bg-blue-100"
                }`}
              >
                {applicant.decision.status}
              </Badge>
              <Badge variant="outline" className="bg-slate-100 lowercase">
                {applicant.decision.round}
              </Badge> */}
              {applicant.background.referrals && (
                <Badge variant="outline" className="bg-slate-100 lowercase">
                  referal: {applicant.background.referrals}
                </Badge>
              )}
            </div>

            <FirstRoundDecision applicantId={applicant.id} />
          </div>

          <AdditionalInfoSection
            basicInfo={applicant.basicInfo}
            background={applicant.background}
          />

          <MissionSection mission={applicant.mission} />
          <LinksSection links={applicant.links} />
        </div>
      </CardContent>
    </Card>
  );
};

interface AdditionalInfoSectionProps {
  basicInfo: Applicant["basicInfo"];
  background: Applicant["background"];
}
const AdditionalInfoSection = ({
  basicInfo,
  background,
}: AdditionalInfoSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-b py-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-muted-foreground w-full lowercase"
      >
        <span className="mr-1">{isExpanded ? "[-]" : "[+]"}</span>
        {isExpanded ? (
          <span>
            {`${background.country}, ${background.gender}, ${basicInfo.email}, ${basicInfo.phoneNumber}${background.college ? `, ${background.college}` : ""}`}
          </span>
        ) : (
          "show details"
        )}
      </button>
    </div>
  );
};

const MissionSection = ({ mission }: { mission: Applicant["mission"] }) => {
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

const LinksSection = ({ links }: { links: Applicant["links"] }) => {
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
