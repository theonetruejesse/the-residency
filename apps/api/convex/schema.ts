import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
  // interview sessions
  sessions: defineTable({
    userId: v.id("users"), // Internal link to users table
    active: v.boolean(),
    sessionUrl: v.string(),
  }).index("by_user_id", ["userId"]),
});
