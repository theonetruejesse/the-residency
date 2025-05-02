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
    active: v.optional(v.boolean()),
    endCallFnId: v.optional(v.union(v.id("_scheduled_functions"), v.null())),
  },
  handler: async (ctx, args) => {
    const patch: any = {
      updatedAt: Date.now(),
    };
    // false also counts as undefined
    if (args.active !== undefined) patch.active = args.active;

    if (args.sessionUrl) patch.sessionUrl = args.sessionUrl;

    // if null, remove the field
    if (args.endCallFnId !== undefined)
      patch.endCallFnId = args.endCallFnId ?? undefined;

    await ctx.db.patch(args.sessionId, patch);
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
