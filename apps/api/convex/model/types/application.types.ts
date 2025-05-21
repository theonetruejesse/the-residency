import { Id, Doc } from "../../_generated/dataModel";

// todo, resolve the type issues later

export type FullApplicantType = {
  id: Id<"applicants">;
  decision: {
    status: "pending" | "waitlisted" | "accepted" | "rejected";
    round: "intake" | "first_round" | "second_round";
    ranking:
      | "likely_reject"
      | "maybe_reject"
      | "neutral"
      | "maybe_accept"
      | "likely_accept";
  };
  basicInfo: Doc<"basicInfo">;
  background: Doc<"backgrounds">;
  links: Doc<"links">;
  mission: Doc<"missions">;
};
