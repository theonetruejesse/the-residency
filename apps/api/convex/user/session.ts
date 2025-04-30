import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";

export const getSession = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
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
    return await ctx.db.insert("sessions", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const updateSession = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    sessionUrl: v.optional(v.string()),
    endCallFnId: v.optional(v.id("_scheduled_functions")),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      sessionUrl: args.sessionUrl,
      endCallFnId: args.endCallFnId,
      active: args.active,
      updatedAt: Date.now(),
    });
  },
});

export const getSessionPersona = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const persona = await ctx.db
      .query("personas")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    return persona;
  },
});

export const createSessionPersona = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    role: v.string(),
    tagline: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("personas", {
      sessionId: args.sessionId,
      role: args.role,
      tagline: args.tagline,
    });
  },
});
