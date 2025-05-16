import { Table } from "convex-helpers/server";
import { v } from "convex/values";

// abstraction; processed based on session state
export const INTERVIEW_STATUS_OPTIONS = v.union(
  v.literal("active_call"),
  v.literal("in_queue"),
  v.literal("post_interview"),
  v.literal("join_queue"),
  v.literal("join_call")
);

export const Sessions = Table("sessions", {
  firstQuestion: v.string(), // first question of the interview; ai generated using the user's mission
  waiting: v.boolean(), // in-queue flag
  inCall: v.boolean(), // in-call flag
  queuedAt: v.optional(v.number()), // timestamp when the session first joined the queue
  sessionUrl: v.optional(v.string()), // expires in 15 minutes; used for denoting which users joined the interview
  scheduledEndTime: v.optional(v.number()), // timestamp when an active session is expected to end
  applicantId: v.id("applicants"),
  missionId: v.id("missions"),
});

export const InterviewGrades = Table("interviewGrades", {
  applicantId: v.id("applicants"),
  conversationId: v.string(), // elevenlabs conversation id
  //   grade: v.number(), // TODO, add later
  // interview notes
  ambition_passion_quotes: v.string(),
  ambition_passion_rationale: v.string(),
  track_record_quotes: v.string(),
  track_record_rationale: v.string(),
  intentionality_decision_quotes: v.string(),
  intentionality_decision_rationale: v.string(),
  rationale_communication_quotes: v.string(),
  rationale_communication_rationale: v.string(),
});
