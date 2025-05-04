import { v } from "convex/values";

export const ROUNDS_OPTIONS = v.union(
  v.literal("intake"),
  v.literal("first_round"),
  v.literal("second_round")
); // current round the user is in

export const STATUSES_OPTIONS = v.union(
  v.literal("pending"),
  v.literal("waitlisted"),
  v.literal("accepted"),
  v.literal("rejected")
);

export const INTERVIEW_STATUS_OPTIONS = v.union(
  v.literal("active_call"),
  v.literal("in_queue"),
  v.literal("post_interview"),
  v.literal("join_queue"),
  v.literal("join_call")
);

export const BACKGROUND = {
  userId: v.id("users"),
  gender: v.string(),
  email: v.string(),
  phoneNumber: v.string(),
  country: v.string(),
  college: v.optional(v.string()),
  referrals: v.optional(v.string()),
};

export const LINK = {
  userId: v.id("users"),
  twitter: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  website: v.optional(v.string()), // todo, array of url + description
};

export const MISSION_RELATIONS = {
  userId: v.id("users"),
};
export const MISSION_ARGS = {
  interest: v.string(),
  accomplishment: v.string(),
};
export const MISSION = {
  ...MISSION_RELATIONS,
  ...MISSION_ARGS,
};
export const MISSION_RETURN = v.object({
  ...MISSION,
  _id: v.id("missions"),
  _creationTime: v.number(),
});

export const USER = {
  firstName: v.string(),
  lastName: v.string(),
  round: ROUNDS_OPTIONS,
  status: STATUSES_OPTIONS,
};
export const USER_RETURN = v.object({
  ...USER,
  _id: v.id("users"),
  _creationTime: v.number(),
});

export const PERSONA_RELATIONS = {
  sessionId: v.id("sessions"),
};
export const PERSONA_ARGS = {
  role: v.string(), // generated role for the persona using the user's mission
  tagline: v.string(), // generated tagline for the persona using the user's mission
};
export const PERSONA = {
  ...PERSONA_RELATIONS,
  ...PERSONA_ARGS,
};

export const SESSION_RELATIONS = {
  userId: v.id("users"),
  missionId: v.id("missions"),
  // scheduled function id for ending call; used for kicking out users after a certain time
  // we use this to implement a queue system for the first round interview
  endCallFnId: v.optional(v.id("_scheduled_functions")),
};

export const SESSION_ARGS = {
  firstQuestion: v.string(), // first question of the interview; ai generated using the user's mission
  waiting: v.boolean(), // in-queue flag
  inCall: v.boolean(), // in-call flag
  queuedAt: v.optional(v.number()), // timestamp when the session first joined the queue
  sessionUrl: v.optional(v.string()), // expires in 15 minutes; used for denoting which users joined the interview
  scheduledEndTime: v.optional(v.number()), // timestamp when an active session is expected to end
};
export const SESSION = {
  ...SESSION_RELATIONS,
  ...SESSION_ARGS,
};
export const SESSION_RETURN = v.object({
  ...SESSION,
  _id: v.id("sessions"),
  _creationTime: v.number(),
});

export const GRADE_RELATIONS = {
  userId: v.id("users"),
};
export const GRADE_ARGS = {
  conversationId: v.string(),
  // ap
  ambition_passion_quotes: v.string(),
  ambition_passion_rationale: v.string(),
  // tr
  track_record_quotes: v.string(),
  track_record_rationale: v.string(),
  // id
  intentionality_decision_quotes: v.string(),
  intentionality_decision_rationale: v.string(),
  // rc
  rationale_communication_quotes: v.string(),
  rationale_communication_rationale: v.string(),
  // todo: add final score
};
export const GRADE = {
  ...GRADE_RELATIONS,
  ...GRADE_ARGS,
};
