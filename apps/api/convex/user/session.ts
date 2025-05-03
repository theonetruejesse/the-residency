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
    firstQuestion: v.string(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      ...args,
      waiting: false,
      inCall: false,
    });
  },
});

export const updateSession = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    sessionUrl: v.optional(v.union(v.string(), v.null())),
    waiting: v.optional(v.boolean()),
    inCall: v.optional(v.boolean()),
    queuedAt: v.optional(v.union(v.number(), v.null())),
    endCallFnId: v.optional(v.union(v.id("_scheduled_functions"), v.null())),
    scheduledEndTime: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: any = {};

    // false also counts as undefined
    if (args.waiting !== undefined) patch.waiting = args.waiting;
    if (args.inCall !== undefined) patch.inCall = args.inCall;

    // if null then remove the field
    if (args.sessionUrl !== undefined) {
      patch.sessionUrl = args.sessionUrl ?? undefined;
    }
    if (args.endCallFnId !== undefined) {
      patch.endCallFnId = args.endCallFnId ?? undefined;
    }
    if (args.scheduledEndTime !== undefined) {
      patch.scheduledEndTime = args.scheduledEndTime ?? undefined;
    }
    if (args.queuedAt !== undefined) {
      patch.queuedAt = args.queuedAt ?? undefined;
    }

    await ctx.db.patch(args.sessionId, patch);
    return null;
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
