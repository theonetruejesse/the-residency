import { FullApplicantType, Id, api } from "@residency/api";
import { Badge } from "@residency/ui/components/badge";
import { Button } from "@residency/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { useAction, useMutation } from "convex/react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HeaderSectionProps {
  applicant: FullApplicantType["applicant"];
}
export const HeaderSection = ({ applicant }: HeaderSectionProps) => {
  const { firstName, lastName } = applicant.basicInfo;
  const { referrals } = applicant.background;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium lowercase flex items-center gap-4">
          {`${firstName} ${lastName}`}
        </h3>
        <ApplicantDecision applicantId={applicant.id} />
      </div>
      <div className="flex items-center justify-between">
        <SelectRanking
          applicantId={applicant.id}
          applicantRanking={applicant.decision.ranking}
        />
        {referrals && (
          <Badge
            variant="outline"
            className="bg-slate-100 lowercase font-normal"
          >
            referred by: {referrals}
          </Badge>
        )}
      </div>
    </div>
  );
};

type StatusActions = "approve" | "waitlist" | "reject";

const useStatusDecision = (applicantId: Id<"applicants">) => {
  const approveRound = useAction(api.application.admin.approveRound);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (decision: StatusActions) => {
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

type Statuses = FullApplicantType["applicant"]["decision"]["status"];

interface ApplicantDecisionProps {
  applicantId: Id<"applicants">;
}
const ApplicantDecision = ({ applicantId }: ApplicantDecisionProps) => {
  const [decision, setDecision] = useState<Statuses>("pending");
  const { handleAction, isSubmitting } = useStatusDecision(applicantId);

  return (
    <div className="flex items-center gap-2">
      <Select
        variant="minimal"
        defaultValue="pending"
        onValueChange={(value) => setDecision(value as Statuses)}
      >
        <SelectTrigger>
          <SelectValue asChild>
            <StatusBadgeWithChevron status={decision} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <StatusBadge status="pending" />
          </SelectItem>
          <SelectItem value="accepted">
            <StatusBadge status="accepted" />
          </SelectItem>
          <SelectItem value="waitlisted">
            <StatusBadge status="waitlisted" />
          </SelectItem>
          <SelectItem value="rejected">
            <StatusBadge status="rejected" />
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={isSubmitting || decision === "pending"}
        onClick={() => handleAction(decision as StatusActions)}
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

type Rankings = FullApplicantType["applicant"]["decision"]["ranking"];

interface SelectRankingProps {
  applicantId: Id<"applicants">;
  applicantRanking: Rankings;
}
const SelectRanking = ({
  applicantId,
  applicantRanking,
}: SelectRankingProps) => {
  const [ranking, setRanking] = useState<Rankings>(applicantRanking);
  const setRankingMutation = useMutation(
    api.application.admin.setApplicantRanking
  );

  const handleRankingChange = (ranking: Rankings) => {
    setRanking(ranking);
    setRankingMutation({ applicantId, ranking });
  };

  return (
    <div className="flex items-center gap-1">
      <span className="font-normal text-md">ranking:</span>
      <Select
        variant="minimal"
        defaultValue={ranking}
        value={ranking}
        onValueChange={(value) => handleRankingChange(value as Rankings)}
      >
        <SelectTrigger>
          <SelectValue asChild>
            <RankingBadgeWithChevron ranking={ranking} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="likely_accept">
            <RankingBadge ranking="likely_accept" />
          </SelectItem>
          <SelectItem value="maybe_accept">
            <RankingBadge ranking="maybe_accept" />
          </SelectItem>
          <SelectItem value="neutral">
            <RankingBadge ranking="neutral" />
          </SelectItem>
          <SelectItem value="maybe_reject">
            <RankingBadge ranking="maybe_reject" />
          </SelectItem>
          <SelectItem value="likely_reject">
            <RankingBadge ranking="likely_reject" />
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// BADGES

const rankingLabels: Record<Rankings, string> = {
  likely_accept: "likely accept",
  maybe_accept: "maybe accept",
  neutral: "neutral",
  maybe_reject: "maybe reject",
  likely_reject: "likely reject",
};

const rankingColors: Record<Rankings, string> = {
  likely_accept: "bg-green-50 text-green-700 border-green-200",
  maybe_accept: "bg-lime-50 text-lime-700 border-lime-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  maybe_reject: "bg-yellow-50 text-yellow-700 border-yellow-200",
  likely_reject: "bg-red-50 text-red-700 border-red-200",
};

const RankingBadge = ({ ranking }: { ranking: Rankings }) => (
  <Badge variant="outline" className={`inline-block ${rankingColors[ranking]}`}>
    {rankingLabels[ranking]}
  </Badge>
);

const RankingBadgeWithChevron = ({ ranking }: { ranking: Rankings }) => (
  <Badge
    variant="outline"
    className={`inline-flex items-center gap-1 ${rankingColors[ranking]}`}
  >
    {rankingLabels[ranking]}
    <ChevronDown className="h-3 w-3" />
  </Badge>
);

const statusLabels: Record<Statuses, string> = {
  pending: "pending",
  accepted: "approve",
  waitlisted: "waitlist",
  rejected: "reject",
};

const statusColors: Record<Statuses, string> = {
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  waitlisted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const StatusBadge = ({ status }: { status: Statuses }) => (
  <Badge
    variant="outline"
    className={`inline-block text-sm ${statusColors[status]}`}
  >
    {statusLabels[status]}
  </Badge>
);

const StatusBadgeWithChevron = ({ status }: { status: Statuses }) => (
  <Badge
    variant="outline"
    className={`inline-flex items-center gap-1 text-lg font-normal ${statusColors[status]}`}
  >
    {statusLabels[status]}
    <ChevronDown className="h-3 w-3" />
  </Badge>
);
