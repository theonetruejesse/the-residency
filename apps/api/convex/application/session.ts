import { v } from "convex/values";
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "../_generated/server";
import { internal } from "../_generated/api";

export const getSession = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const createSession = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    missionId: v.id("missions"),
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

// PERSONA STUFF

export const getSessionPersona = internalQuery({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("personas")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
  },
});

export const createSessionPersona = internalAction({
  args: {
    sessionId: v.id("sessions"),
    interest: v.string(),
    accomplishment: v.string(),
  },
  handler: async (ctx, args) => {
    const { interest, accomplishment, sessionId } = args;

    const { role, tagline } = await ctx.runAction(
      internal.application.action.generateContent,
      {
        interest,
        accomplishment,
      }
    );

    await ctx.runMutation(internal.application.session.createPersona, {
      sessionId,
      role,
      tagline,
    });

    return null;
  },
});

export const createPersona = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    role: v.string(),
    tagline: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("personas", args);
  },
});
