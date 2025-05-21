import { Table } from "convex-helpers/server";
import { v } from "convex/values";

// abstraction; processed based on session state
export const SESSION_STATUS_OPTIONS = v.union(
  v.literal("active_call"),
  v.literal("in_queue"),
  v.literal("post_interview"),
  v.literal("join_queue"),
  v.literal("join_call")
);

export const Sessions = Table("sessions", {
  waiting: v.boolean(), // in-queue flag
  inCall: v.boolean(), // in-call flag
  queuedAt: v.optional(v.number()), // timestamp when the session first joined the queue
  sessionUrl: v.optional(v.string()), // expires in 15 minutes; used for denoting which users joined the interview
  scheduledEndTime: v.optional(v.number()), // timestamp when an active session is expected to end
  // scheduled function id for ending call; used for kicking out users after a certain time
  // we use this to implement a queue system for the first round interview
  endCallFnId: v.optional(v.id("_scheduled_functions")),
  applicantId: v.id("applicants"),
  missionId: v.id("missions"),
});

export const Personas = Table("personas", {
  sessionId: v.id("sessions"),
  role: v.string(), // generated role for the persona using the user's mission
  tagline: v.string(), // generated tagline for the persona using the user's mission
});

export const Interviews = Table("interviews", {
  applicantId: v.id("applicants"),
  conversationId: v.string(), // elevenlabs conversation id
  audioUrl: v.string(), // url to the audio file, stored in uploadthing
  score: v.number(), // final score for the interview
});

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

export const Grades = Table("grades", {
  interviewId: v.id("interviews"),
  criteria: CRITERIA_OPTIONS,
  grade: GRADE_OPTIONS,
  quote: v.string(),
  rationale: v.string(),
});
