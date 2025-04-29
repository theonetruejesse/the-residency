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

export const SESSION_ARGS = {
  active: v.boolean(),
  firstQuestion: v.string(), // first question of the interview; ai generated using the user's mission
  sessionUrl: v.optional(v.string()), // expires in 15 minutes; used for denoting which users joined the interview
};
export const SESSION_RELATIONS = {
  userId: v.id("users"),
  missionId: v.id("missions"),
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
