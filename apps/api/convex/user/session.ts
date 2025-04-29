import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";

export const getSession = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    missionId: v.id("missions"),
    active: v.boolean(),
    firstQuestion: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      ...args,
    });
  },
});

export const updateSession = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    sessionUrl: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      sessionUrl: args.sessionUrl,
      active: args.active,
    });
  },
});
