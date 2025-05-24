"use client";

import { FullApplicantType, InterviewGrade } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@residency/ui/components/badge";
import {
  TwitterSvg,
  LinkedinSvg,
  GithubSvg,
  WebsiteSvg,
} from "@/components/social-svgs";
import { Card, CardContent } from "@residency/ui/components/card";
import { Skeleton } from "@residency/ui/components/skeleton";
import { Alert, AlertDescription } from "@residency/ui/components/alert";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@residency/ui/components/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@residency/ui/components/accordion";
import { Separator } from "@residency/ui/components/separator";

// WRAPPERS

export const CardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="w-lg py-6">
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

interface AdditionalWrapperProps {
  children: React.ReactNode;
}
export const AdditionalWrapper = ({ children }: AdditionalWrapperProps) => {
  return (
    <div>
      <Separator className="mt-2" />
      <Accordion
        type="single"
        collapsible
        className="text-sm text-muted-foreground"
      >
        <AccordionItem value="background">
          <AccordionTrigger>applicant info</AccordionTrigger>
          <AccordionContent className="space-y-3 p-0">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// not super clean with typing, but works
interface InterviewWrapperProps {
  interview: FullApplicantType["interview"];
  children: React.ReactNode;
}
export const InterviewWrapper = ({
  interview,
  children,
}: InterviewWrapperProps) => {
  if (!interview) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          this applicant has not completed their interview yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <audio
        src={interview.interview.audioUrl}
        controls
        className="w-full py-1"
      />
      {children}
    </div>
  );
};

// BODY SECTIONS

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

interface GradesSectionProps {
  interview: InterviewGrade;
}

export const GradesSection = ({ interview }: GradesSectionProps) => {
  return (
    <Tabs defaultValue="score">
      <TabsList className="w-full">
        <TabsTrigger value="score" className="flex-1 font-semibold">
          score
        </TabsTrigger>
        {interview.grades.map((grade) => (
          <TabsTrigger
            key={grade.criteria}
            value={grade.criteria}
            className="flex-1"
          >
            {grade.criteria}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="score" className="pt-2">
        <ScoreTable interview={interview} />
        <div className="flex items-center gap-2 mt-4">
          <span className="font-semibold">final score:</span>
          <Badge className="bg-green-500">{interview.interview.score}</Badge>
        </div>
      </TabsContent>
      {interview.grades.map((g) => (
        <CriteriaTab key={g.criteria} grade={g} />
      ))}
    </Tabs>
  );
};

interface ScoreTabProps {
  interview: InterviewGrade;
}

export const ScoreTable = ({ interview }: ScoreTabProps) => (
  <div>
    <table className="w-full border-collapse border border-gray-200">
      <thead>
        <tr>
          {interview.grades.map((grade) => (
            <th
              key={grade.criteria}
              className="p-2 text-center lowercase border border-gray-200 bg-gray-50 font-normal"
            >
              {grade.criteria}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {interview.grades.map((grade) => (
            <td
              key={grade.criteria}
              className="p-2 text-center border border-gray-200"
            >
              <div className="flex justify-center">
                <GradeBadge grade={grade.grade} />
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

interface CriteriaTabProps {
  grade: InterviewGrade["grades"][number];
}
const CriteriaTab = ({ grade }: CriteriaTabProps) => {
  const { criteria, quote, rationale, grade: gradeValue } = grade;
  return (
    <TabsContent key={criteria} value={criteria} className="pt-4">
      <div className="space-y-2 lowercase">
        <div>
          <span className="font-semibold">quote: </span>
          <span className="italic">"{quote}"</span>
        </div>
        <div>
          <span className="font-semibold">rationale: </span>
          <span>{rationale}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold lowercase">grade:</span>
          <GradeBadge grade={gradeValue} />
        </div>
      </div>
    </TabsContent>
  );
};

const GradeBadge = ({ grade }: { grade: string }) => {
  let gradeColor = null;
  switch (grade) {
    case "high":
      gradeColor = "bg-green-50 text-green-700 border-green-200";
      break;
    case "medium":
      gradeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
      break;
    case "low":
      gradeColor = "bg-red-50 text-red-700 border-red-200";
      break;
    default:
      gradeColor = "bg-gray-50 text-gray-700 border-gray-200";
  }
  return (
    <Badge variant="outline" className={`inline-block ${gradeColor}`}>
      {grade}
    </Badge>
  );
};
