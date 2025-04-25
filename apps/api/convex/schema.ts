import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ROUNDS = v.union(
  v.literal("intake"),
  v.literal("first_round"),
  v.literal("second_round")
); // current round the user is in

export const STATUSES = v.union(
  v.literal("pending"),
  v.literal("waitlisted"),
  v.literal("accepted"),
  v.literal("rejected")
);

export const BACKGROUNDS = {
  gender: v.string(),
  email: v.string(),
  phoneNumber: v.string(),
  country: v.string(),
  college: v.optional(v.string()),
  referrals: v.optional(v.string()),
};

export const LINKS = {
  twitter: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  website: v.optional(v.string()), // todo, array of url + description
};

export const MISSIONS = {
  interest: v.string(),
  accomplishment: v.string(),
};

export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    round: ROUNDS,
    status: STATUSES,
  })
    .index("by_round", ["round"])
    .index("by_status", ["status"]),

  // user background info
  backgrounds: defineTable({
    userId: v.id("users"),
    ...BACKGROUNDS,
  }).index("by_user_id", ["userId"]),

  // user social media links
  links: defineTable({
    userId: v.id("users"),
    ...LINKS,
  }).index("by_user_id", ["userId"]),

  // focus for the first round interview
  missions: defineTable({
    userId: v.id("users"),
    ...MISSIONS,
  }).index("by_user_id", ["userId"]),

  // first round interview sessions
  sessions: defineTable({
    userId: v.id("users"),
    active: v.boolean(),
    sessionUrl: v.string(), // expires in 15 minutes
  }).index("by_user_id", ["userId"]),
});
