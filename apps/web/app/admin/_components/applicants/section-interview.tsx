import type { FullApplicantType, InterviewGrade } from "@residency/api";
import { Alert, AlertDescription } from "@residency/ui/components/alert";
import { Badge } from "@residency/ui/components/badge";
import { Separator } from "@residency/ui/components/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@residency/ui/components/tabs";
import { AlertCircle } from "lucide-react";

interface ScoreSectionProps {
  interview: FullApplicantType["interview"];
}
export const ScoreSection = ({ interview }: ScoreSectionProps) => {
  return (
    <InterviewWrapper interview={interview}>
      <ScoreTable interview={interview as InterviewGrade} />
    </InterviewWrapper>
  );
};

interface GradesSectionProps {
  interview: FullApplicantType["interview"];
}
export const GradesSection = ({ interview }: GradesSectionProps) => {
  return (
    <InterviewWrapper interview={interview}>
      <GradesTabs interview={interview as InterviewGrade} />
    </InterviewWrapper>
  );
};

// not super clean with typing, but works
interface InterviewWrapperProps {
  interview: FullApplicantType["interview"];
  children: React.ReactNode;
}
const InterviewWrapper = ({ interview, children }: InterviewWrapperProps) => {
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

  const audioUrl = interview.interview.audioUrl;

  return (
    <div className="space-y-4">
      {audioUrl && (
        <audio
          src={audioUrl}
          preload="metadata"
          controls
          className="w-full py-1"
        />
      )}
      {children}
    </div>
  );
};

interface GradesTabsProps {
  interview: InterviewGrade;
}
const GradesTabs = ({ interview }: GradesTabsProps) => {
  const i = interview as InterviewGrade; // not clean, but works
  return (
    <Tabs defaultValue="score">
      <TabsList className="w-full">
        <TabsTrigger value="score" className="flex-1 font-semibold">
          score
        </TabsTrigger>
        <Separator orientation="vertical" className="mx-1" />
        {i.grades.map((grade) => (
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
        <ScoreTable interview={i} />
        {/* <div className="flex items-center gap-2 mt-4">
          <span className="font-semibold">final score:</span>
          <Badge className="bg-green-500">{i.interview.score}</Badge>
        </div> */}
      </TabsContent>
      {i.grades.map((g) => (
        <CriteriaTab key={g.criteria} grade={g} />
      ))}
    </Tabs>
  );
};

interface ScoreTabProps {
  interview: InterviewGrade;
}

const ScoreTable = ({ interview }: ScoreTabProps) => (
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
