import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const STATUS_OPTIONS = v.union(
  v.literal("pending"),
  v.literal("waitlisted"),
  v.literal("accepted"),
  v.literal("rejected")
);

export const RANKING_OPTIONS = v.union(
  v.literal("likely_reject"),
  v.literal("maybe_reject"),
  v.literal("neutral"),
  v.literal("maybe_accept"),
  v.literal("likely_accept")
);

export const ROUND_OPTIONS = v.union(
  v.literal("intake"),
  v.literal("first_round"),
  v.literal("second_round")
); // current round the user is in

// todo: update here later
export const COHORT_OPTIONS = v.union(
  v.literal("SUMMER_2025"),
  v.literal("FALL_2025")
);

export const CRITERIA_OPTIONS = v.union(
  v.literal("mission"),
  v.literal("intelligence"),
  v.literal("vision"),
  v.literal("traction"),
  v.literal("determination")
);

export const GRADE_OPTIONS = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
  v.literal("unclear")
);

export const Applicants = Table("applicants", {
  cohort: COHORT_OPTIONS,
  status: STATUS_OPTIONS,
  round: ROUND_OPTIONS,
  ranking: RANKING_OPTIONS,
  basicInfoId: v.id("basicInfo"),
  missionId: v.id("missions"),
  backgroundId: v.id("backgrounds"),
  linkId: v.id("links"),
  userId: v.optional(v.id("users")), // only set after they pass the intake round
});

export const BasicInfo = Table("basicInfo", {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  phoneNumber: v.string(),
});

export const Missions = Table("missions", {
  interest: v.string(),
  accomplishment: v.string(),
});

export const Backgrounds = Table("backgrounds", {
  gender: v.string(),
  country: v.string(),
  college: v.optional(v.string()),
  referrals: v.optional(v.string()),
});

export const Links = Table("links", {
  twitter: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  website: v.optional(v.string()), // todo, array of url + description
});

export const Interviews = Table("interviews", {
  applicantId: v.id("applicants"),
  conversationId: v.string(), // elevenlabs conversation id
  audioUrl: v.string(), // url to the audio file, stored in uploadthing
  score: v.number(), // final score for the interview
});

export const Grades = Table("grades", {
  criteria: CRITERIA_OPTIONS,
  grade: GRADE_OPTIONS,
  interviewId: v.id("interviews"),
  rationale: v.string(), // why this grade?
  quote: v.string(), // quote from the interview
});

export const Notes = Table("notes", {
  applicantId: v.id("applicants"),
  createdBy: v.id("users"),
  note: v.string(),
});
