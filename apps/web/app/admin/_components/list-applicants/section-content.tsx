"use client";

import type { FullApplicantType } from "@residency/api";
import { useState } from "react";
import {
  TwitterSvg,
  LinkedinSvg,
  GithubSvg,
  WebsiteSvg,
} from "@/components/social-svgs";

interface BackgroundSectionProps {
  background: FullApplicantType["applicant"]["background"];
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
  mission: FullApplicantType["applicant"]["mission"];
}
export const MissionSection = ({ mission }: MissionSectionProps) => {
  return (
    <div className="space-y-1 lowercase">
      <div>
        <span className="font-semibold">interests: </span>
        <span>{mission.interest}</span>
      </div>
      <div>
        <span className="font-semibold">accomplishments: </span>
        <span>{mission.accomplishment}</span>
      </div>
    </div>
  );
};

interface LinksSectionProps {
  links: FullApplicantType["applicant"]["links"];
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
