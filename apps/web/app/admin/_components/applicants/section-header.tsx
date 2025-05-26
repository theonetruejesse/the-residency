import type { FullApplicantType, Id } from "@residency/api";
import { api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { useAction, useMutation } from "convex/react";
import { ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import type { StatusActions, StatusStates, Rankings } from "./helper-badges";
import {
  StatusSelectBadge,
  StatusBadge,
  RankingSelectBadge,
  RankingBadge,
  ReferralBadge,
  RoundBadge,
} from "./helper-badges";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@residency/ui/components/tooltip";

interface HeaderSectionProps {
  applicant: FullApplicantType["applicant"];
}
export const PendingHeaderSection = ({ applicant }: HeaderSectionProps) => {
  const { firstName, lastName } = applicant.basicInfo;
  const { referrals } = applicant.background;

  return (
    <div>
      <div className="flex items-center justify-between">
        <GivenBasicInfo basicInfo={applicant.basicInfo} />
        <ApplicantDecision applicantId={applicant.id} />
      </div>
      <div className="flex items-center justify-between">
        <SelectRanking
          applicantId={applicant.id}
          applicantRanking={applicant.decision.ranking}
        />
        {referrals && <ReferralBadge referrals={referrals} />}
      </div>
    </div>
  );
};

export const DoneHeaderSection = ({ applicant }: HeaderSectionProps) => {
  const { referrals } = applicant.background;
  const { ranking } = applicant.decision;

  return (
    <div>
      <GivenBasicInfo basicInfo={applicant.basicInfo} />
      <div className="flex gap-2">
        <RoundBadge round={applicant.decision.round} />
        <RankingBadge ranking={ranking} isRankingText={true} />
        {referrals && <ReferralBadge referrals={referrals} />}
      </div>
    </div>
  );
};

interface GivenBasicInfoProps {
  basicInfo: FullApplicantType["applicant"]["basicInfo"];
}
const GivenBasicInfo = ({ basicInfo }: GivenBasicInfoProps) => {
  const { firstName, lastName, email, phoneNumber } = basicInfo;
  return (
    <div className="flex flex-row justify-start items-center gap-2">
      <h3 className="text-xl font-medium lowercase mb-2 flex items-center gap-1.5">
        {`${firstName} ${lastName}`}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center">
              <Info className="h-4 w-4 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col">
              <span>{email}</span>
              <span>{phoneNumber}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </h3>
    </div>
  );
};

interface ApplicantDecisionProps {
  applicantId: Id<"applicants">;
}

const ApplicantDecision = ({ applicantId }: ApplicantDecisionProps) => {
  const [decision, setDecision] = useState<StatusStates>("pending");
  const { handleAction, isSubmitting } = useStatusDecision(applicantId);

  const statuses = [
    "pending",
    "approve",
    "waitlist",
    "reject",
  ] as StatusStates[];

  return (
    <div className="flex items-center gap-2">
      <Select
        variant="minimal"
        defaultValue="pending"
        onValueChange={(value) => setDecision(value as StatusStates)}
      >
        <SelectTrigger>
          <SelectValue asChild>
            <StatusSelectBadge status={decision} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              <StatusBadge status={status as StatusStates} />
            </SelectItem>
          ))}
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

  const rankingOptions = [
    "likely_accept",
    "maybe_accept",
    "neutral",
    "maybe_reject",
    "likely_reject",
  ] as Rankings[];

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
            <RankingSelectBadge ranking={ranking} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {rankingOptions.map((ranking) => (
            <SelectItem key={ranking} value={ranking}>
              <RankingBadge ranking={ranking} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const useStatusDecision = (applicantId: Id<"applicants">) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveRound = useAction(api.application.admin.approveRound);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);

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
