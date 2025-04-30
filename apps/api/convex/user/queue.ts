import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { MAX_CONCURRENT_CALLS, MAX_SESSION_DURATION } from "../constants";
import { Doc, Id } from "../_generated/dataModel";

// active sessions are within the queue
// active sessions with endCallFnId are active calls

export const handleQueue = internalAction({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const isQueueFull = await ctx.runQuery(internal.user.queue.isQueueFull);
    const isNextUser =
      (await ctx.runQuery(internal.user.queue.nextUserInQueue)) === args.userId;
    const isUserInQueue = await ctx.runQuery(
      internal.user.queue.isUserInQueue,
      {
        userId: args.userId,
      }
    );

    // start call
    if (!isQueueFull || (isNextUser && isUserInQueue)) {
      await ctx.runAction(internal.user.queue.createActiveCall, {
        sessionId: args.sessionId,
      });
      return;
    }

    // join queue
    if (!isUserInQueue) {
      await ctx.runMutation(internal.user.session.updateSession, {
        sessionId: args.sessionId,
        active: true,
      });
      return;
    }

    // else, do nothing (otherwise we ruin the queue ordering)
    return;
  },
});

export const createActiveCall = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const { sessionId } = args;

    await ctx.runAction(internal.user.actions.generateSessionUrl, {
      sessionId,
    });

    const endCallFnId = await ctx.scheduler.runAfter(
      MAX_SESSION_DURATION,
      internal.user.queue.leaveQueue,
      { sessionId }
    );
    await ctx.runMutation(internal.user.session.updateSession, {
      sessionId,
      endCallFnId,
      active: true,
    });
  },
});

export const leaveQueue = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    endCallFnId: v.optional(v.id("_scheduled_functions")),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.user.session.updateSession, {
      sessionId: args.sessionId,
      active: false,
      endCallFnId: undefined,
    });
    if (args.endCallFnId) {
      await ctx.scheduler.cancel(args.endCallFnId);
    }
  },
});

export const isQueueFull = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx): Promise<boolean> => {
    const activeCalls = await ctx.runQuery(internal.user.queue.listActiveCalls);
    return activeCalls.length >= MAX_CONCURRENT_CALLS;
  },
});

export const nextUserInQueue = internalQuery({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx): Promise<Id<"users"> | null> => {
    const firstSession = await ctx.db
      .query("sessions")
      .withIndex("by_active_updatedAt", (q) => q.eq("active", true))
      .filter((q) => q.eq(q.field("endCallFnId"), undefined))
      .order("asc") // Oldest updated first
      .first();

    return firstSession?.userId ?? null;
  },
});

export const isUserInQueue = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return session !== null && session.active;
  },
});

// export const maxCallWaitTime = internalQuery({
//   args: {
//     sessionId: v.id("sessions"),
//   },
//   returns: v.number(),
//   handler: async (ctx, args) => {
//     const session = await ctx.db.get(args.sessionId);
//     if (!session) throw new Error("Session not found");

//     if (session.endCallFnId) return 0; // call is active

//     const endCallFn = await ctx.db.system.get(session.endCallFnId);
//     if (!endCallFn) throw new Error("End call function not found");

//     const endCallTime = new Date(endCallFn.scheduledAt);
//     const now = new Date();
//     const timeDiff = now.getTime() - endCallTime.getTime();
//     return timeDiff;
//   },
// });

// returns all active sessions; in queue order
export const listQueueSessions = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_active_updatedAt", (q) => q.eq("active", true))
      .order("asc") // Oldest updated first
      .collect();
  },
});

// returns all active calls in active sessions
export const listActiveCalls = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    const activeSessions = await ctx.runQuery(
      internal.user.queue.listQueueSessions
    );

    return activeSessions.filter((session) => session.endCallFnId);
  },
});
