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
      active: false,
      inCall: false,
      updatedAt: Date.now(),
    });
  },
});

export const updateSession = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    sessionUrl: v.optional(v.union(v.string(), v.null())),
    active: v.optional(v.boolean()),
    inCall: v.optional(v.boolean()),
    queuedAt: v.optional(v.number()),
    endCallFnId: v.optional(v.union(v.id("_scheduled_functions"), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: any = {};

    // Only update queuedAt when explicitly provided
    if (args.queuedAt !== undefined) {
      patch.queuedAt = args.queuedAt;
    }

    // Only update updatedAt when joining the queue
    const isJoiningQueue =
      args.active === true &&
      args.inCall === undefined &&
      args.endCallFnId === undefined &&
      args.sessionUrl === undefined;
    if (isJoiningQueue) {
      patch.updatedAt = Date.now();
    }

    // false also counts as undefined
    if (args.active !== undefined) patch.active = args.active;
    if (args.inCall !== undefined) patch.inCall = args.inCall;

    // if sessionUrl is explicitly provided
    if (args.sessionUrl !== undefined) {
      patch.sessionUrl = args.sessionUrl ?? undefined;
    }
    if (args.endCallFnId !== undefined) {
      patch.endCallFnId = args.endCallFnId ?? undefined;
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
