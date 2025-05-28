import { Infer } from "convex/values";
import { Id, Doc } from "../_generated/dataModel";
import {
  RANKING_OPTIONS,
  ROUND_OPTIONS,
  STATUS_OPTIONS,
} from "../model/applicants";
import { SESSION_STATUS_OPTIONS } from "../model/sessions";

export type FullApplicantType = {
  applicant: {
    id: Id<"applicants">;
    decision: {
      status: Infer<typeof STATUS_OPTIONS>;
      round: Infer<typeof ROUND_OPTIONS>;
      ranking: Infer<typeof RANKING_OPTIONS>;
    };
    basicInfo: Doc<"basicInfo">;
    background: Doc<"backgrounds">;
    links: Doc<"links">;
    mission: Doc<"missions">;
  };
  interview: InterviewGrade | null;
  notes: Note[];
};

export type Note = Doc<"notes"> & { creator: string };

export type InterviewGrade = {
  interview: Doc<"interviews">;
  grades: Doc<"grades">[];
};

export type UserApplicant = {
  user: Doc<"users">;
  applicant: Doc<"applicants">;
};

export type ApplicantProfile = {
  id: Id<"applicants">;
  session: Doc<"sessions">;
  basicInfo: Doc<"basicInfo">;
  mission: Doc<"missions">;
};

export type SessionStatus = Infer<typeof SESSION_STATUS_OPTIONS>;

export type WaitListMember = {
  sessionId: Id<"sessions">;
  role: string;
  tagline: string;
};
