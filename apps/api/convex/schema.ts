import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { USER, BACKGROUND, LINK, MISSION, SESSION } from "./schema.types";

export default defineSchema({
  users: defineTable({
    ...USER,
  })
    .index("by_round", ["round"])
    .index("by_status", ["status"]),

  // user background info
  backgrounds: defineTable({
    ...BACKGROUND,
  }).index("by_user_id", ["userId"]),

  // user social media links
  links: defineTable({
    ...LINK,
  }).index("by_user_id", ["userId"]),

  // focus for the first round interview
  missions: defineTable({
    ...MISSION,
  }).index("by_user_id", ["userId"]),

  // first round interview sessions
  sessions: defineTable({
    ...SESSION,
  })
    .index("by_user_id", ["userId"])
    .index("by_mission_id", ["missionId"])
    .index("by_active", ["active"]),

  // first round interview evaluation; webhook from elevenlabs
  grades: defineTable({
    userId: v.id("users"),
    conversationId: v.string(),
    feedback: v.string(),
  }).index("by_user_id", ["userId"]),
});
