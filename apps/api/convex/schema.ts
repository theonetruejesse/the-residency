import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  USER,
  BACKGROUND,
  LINK,
  MISSION,
  SESSION,
  PERSONA,
} from "./schema.types";

export default defineSchema({
  // USER STUFF
  users: defineTable({
    ...USER,
  })
    .index("by_round", ["round"])
    .index("by_status", ["status"]),
  backgrounds: defineTable({
    ...BACKGROUND,
  }).index("by_user_id", ["userId"]),

  links: defineTable({
    ...LINK,
  }).index("by_user_id", ["userId"]),

  // INTERVIEW STUFF

  // focus for the first round interview
  missions: defineTable({
    ...MISSION,
  }).index("by_user_id", ["userId"]),

  // anomynous user info for the interview queue
  personas: defineTable({
    ...PERSONA,
  }).index("by_session_id", ["sessionId"]),

  // first round interview sessions
  sessions: defineTable({
    ...SESSION,
  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["active"])
    .index("by_active_updatedAt", ["active", "updatedAt"])
    .index("by_active_queuedAt", ["active", "queuedAt"])
    .index("by_inCall_updatedAt", ["inCall", "updatedAt"]),

  // first round interview evaluation; webhook from elevenlabs
  grades: defineTable({
    userId: v.id("users"),
    conversationId: v.string(),
    feedback: v.string(),
  }).index("by_user_id", ["userId"]),
});
