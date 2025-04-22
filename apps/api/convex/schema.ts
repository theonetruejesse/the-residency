import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// todo, validate userId uniqueness
export default defineSchema({
  users: defineTable({
    name: v.string(),
    userId: v.number(), // agora uid + roomId
  }).index("by_user_id", ["userId"]),
  sessions: defineTable({
    sessionId: v.id("users"),
    active: v.boolean(),
    sessionToken: v.string(),
    expiresAt: v.number(),
  }).index("by_session_id", ["sessionId"]),
});
