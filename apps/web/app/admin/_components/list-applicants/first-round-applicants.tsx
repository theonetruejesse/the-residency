"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, Play, Pause, AlertCircle } from "lucide-react";
import { Button } from "@residency/ui/components/button";
import { Card, CardContent } from "@residency/ui/components/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@residency/ui/components/tabs";
import { Alert, AlertDescription } from "@residency/ui/components/alert";
import { Badge } from "@residency/ui/components/badge";
import { api } from "@residency/api";
import { useAction, usePaginatedQuery } from "convex/react";
// import { ListSkeleton } from "./list-skeleton";
import { Id } from "@residency/api/convex/_generated/dataModel";
import { Separator } from "@residency/ui/components/separator";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Accordion } from "@residency/ui/components/accordion";

// Type definitions based on backend structure
type Grade = {
  criteria:
    | "mission"
    | "intelligence"
    | "vision"
    | "traction"
    | "determination";
  grade: "high" | "medium" | "low" | "unclear";
  rationale: string;
  quote: string;
};

// Adjusted to match the backend structure from types/application.types.ts
type InterviewData = {
  interview: {
    audioUrl: string;
    score: number;
    _id: string;
    // Other fields from the interview document
  };
  grades: Grade[];
};

const useFirstRoundList = () => {
  const {
    results: applicants,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.application.admin.firstRoundApplicants,
    {
      paginationOpts: {
        numItems: 10,
      },
    },
    { initialNumItems: 10 }
  );

  return { applicants, status, loadMore };
};

type FirstRoundApplicantsQuery = ReturnType<typeof useFirstRoundList>;
type FirstRoundApplicantType = Awaited<
  FirstRoundApplicantsQuery["applicants"][number]
>[][number];

export const FirstRoundApplicants = () => {
  const applicantsQuery = useFirstRoundList();

  const content =
    applicantsQuery.status === "LoadingFirstPage" ? (
      // <ListSkeleton />
      <div>hello</div>
    ) : (
      <ListContent applicantsQuery={applicantsQuery} />
    );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-medium">first round</h1>
      {content}
    </div>
  );
};

interface ListContentProps {
  applicantsQuery: FirstRoundApplicantsQuery;
}

const ListContent = ({ applicantsQuery }: ListContentProps) => {
  const { applicants, status, loadMore } = applicantsQuery;

  return (
    <>
      {applicants.map((applicantData) => (
        <FirstRoundApplicantCard
          key={applicantData.applicant.id as string}
          applicantData={applicantData}
        />
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
  applicantData: FirstRoundApplicantType;
}

export const FirstRoundApplicantCard = ({
  applicantData,
}: ApplicantCardProps) => {
  const { applicant, interview } = applicantData;

  return (
    <Card className="w-lg">
      <CardContent className="px-6">
        <div className="flex flex-col space-y-4">
          {/* Header with name and decision */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium lowercase flex items-center gap-4">
              {applicant.basicInfo.firstName} {applicant.basicInfo.lastName}
            </h3>
            <FirstRoundDecision applicantId={applicant.id} />
          </div>

          {/* Interview Section */}
          <InterviewSection interview={interview} />
        </div>
        <Separator className="my-2" />
        <div className="text-sm text-muted-foreground">
          <Accordion type="single" collapsible>
            <AccordionItem value="background">
              <AccordionTrigger>background</AccordionTrigger>
              <AccordionContent>
                <p>hello world</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

// Interview section component
interface InterviewSectionProps {
  interview: InterviewData | null;
}

const InterviewSection = ({ interview }: InterviewSectionProps) => {
  if (!interview) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          this applicant has not completed their interview yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Audio Player */}
      {/* <AudioPlayer audioUrl={interview.interview.audioUrl} /> */}
      <audio
        src={interview.interview.audioUrl}
        controls
        className="w-full py-1"
      />

      {/* Criteria Tabs */}
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

        {/* Score Tab Content */}
        <TabsContent value="score" className="pt-2">
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
                        <Badge
                          variant="outline"
                          className={`
                            inline-block
                            ${
                              grade.grade === "high"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : grade.grade === "medium"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : grade.grade === "low"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          `}
                        >
                          {grade.grade}
                        </Badge>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="font-bold">final score:</span>
            <Badge className="bg-green-500">{interview.interview.score}</Badge>
          </div>
        </TabsContent>

        {/* Individual Criteria Tab Contents */}
        {interview.grades.map((grade) => (
          <TabsContent
            key={grade.criteria}
            value={grade.criteria}
            className="pt-4"
          >
            <div className="space-y-2 lowercase">
              <div>
                <span className="font-bold">Quote: </span>
                <span className="italic">"{grade.quote}"</span>
              </div>
              <div>
                <span className="font-bold">Rationale: </span>
                <span>{grade.rationale}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold lowercase">grade:</span>
                <Badge
                  variant="outline"
                  className={`
                    inline-block
                    ${
                      grade.grade === "high"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : grade.grade === "medium"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : grade.grade === "low"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  `}
                >
                  {grade.grade}
                </Badge>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Decision component
type FirstRoundActions = "approve" | "waitlist" | "reject";

const useFirstRoundDecision = (applicantId: string | Id<"applicants">) => {
  // Using waitlistApplicant and rejectApplicant which exist in the API
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);
  // For first round approval, we'll use approveIntake since it's the one that exists
  // This will need to be replaced with the actual function for approving first round applicants
  const approveIntake = useAction(api.application.admin.approveIntake);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (decision: FirstRoundActions) => {
    try {
      setIsSubmitting(true);

      // Convert to proper ID type if needed
      const typedApplicantId = applicantId as Id<"applicants">;

      switch (decision) {
        case "approve":
          // This should be updated once the proper function for approving first round is available
          await approveIntake({ applicantId: typedApplicantId });
          break;
        case "waitlist":
          await waitlistApplicant({ applicantId: typedApplicantId });
          break;
        case "reject":
          await rejectApplicant({ applicantId: typedApplicantId });
          break;
      }
    } catch (error) {
      console.error("Error updating applicant status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleAction, isSubmitting };
};

interface ApplicantDecisionProps {
  applicantId: string | Id<"applicants">;
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
