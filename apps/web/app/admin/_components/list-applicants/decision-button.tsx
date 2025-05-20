import { api } from "@residency/api";
import { Button } from "@residency/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { useAction } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";
import type { Applicant } from ".";

// todo, expand out to support other rounds

type FirstRoundActions = "approve" | "waitlist" | "reject";

const useFirstRoundDecision = (applicantId: Applicant["id"]) => {
  const approveIntake = useAction(api.application.admin.approveIntake);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (decision: FirstRoundActions) => {
    try {
      setIsSubmitting(true);
      const id = applicantId;
      switch (decision) {
        case "approve":
          await approveIntake({ applicantId: id });
          break;
        case "waitlist":
          await waitlistApplicant({ applicantId: id });
          break;
        case "reject":
          await rejectApplicant({ applicantId: id });
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
  applicantId: Applicant["id"];
}
export const FirstRoundDecision = ({ applicantId }: ApplicantDecisionProps) => {
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
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
