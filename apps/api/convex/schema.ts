import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// todo, validate userId uniqueness
export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
  // interview sessions
  sessions: defineTable({
    userId: v.id("users"), // Internal link to users table
    sessionId: v.number(), // agora uid + roomId
    sessionToken: v.string(),
    expiresAt: v.number(),
    active: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_session_id", ["sessionId"]),
});
