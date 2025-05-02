import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalQuery } from "../_generated/server";
import { MAX_CONCURRENT_CALLS, MAX_SESSION_DURATION } from "../constants";
import { Doc, Id } from "../_generated/dataModel";
import { SESSION_RETURN } from "../schema.types";

// active sessions are within the queue
// active sessions with endCallFnId are active calls

/*
 * INTERNAL QUERIES
 */

export const listQueueSessions = internalQuery({
  args: {},
  returns: v.array(SESSION_RETURN),
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_active_updatedAt", (q: any) => q.eq("active", true))
      .order("asc")
      .collect();
  },
});

export const listActiveCalls = internalQuery({
  args: {},
  returns: v.array(SESSION_RETURN),
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_inCall_updatedAt", (q) => q.eq("inCall", true))
      .order("asc")
      .collect();
  },
});

export const listWaitingSessions = internalQuery({
  args: {},
  returns: v.array(SESSION_RETURN),
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    // Return queued sessions in order of original queue time
    return await ctx.db
      .query("sessions")
      .withIndex("by_active_queuedAt", (q) => q.eq("active", true))
      .filter((q) => q.eq(q.field("inCall"), false))
      .order("asc")
      .collect();
  },
});

export const isQueueFull = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx): Promise<boolean> => {
    const activeCalls = await ctx.runQuery(
      internal.user.queue.listActiveCalls,
      {}
    );
    return activeCalls.length >= MAX_CONCURRENT_CALLS;
  },
});

export const getSessionWaitTime = internalQuery({
  args: { sessionId: v.id("sessions") },
  returns: v.number(),
  handler: async (ctx, { sessionId }): Promise<number> => {
    // Get queued and in-call sessions via internal queries
    const waiting = await ctx.runQuery(
      internal.user.queue.listWaitingSessions,
      {}
    );
    const inCalls = await ctx.runQuery(internal.user.queue.listActiveCalls, {});
    // If slots free or already in call, no wait
    if (
      inCalls.length < MAX_CONCURRENT_CALLS ||
      inCalls.some((s) => s._id === sessionId)
    ) {
      return 0;
    }
    const now = Date.now();
    // Build a min-heap via sorted array of end times
    const endTimes: number[] = [];
    for (const call of inCalls) {
      if (call.endCallFnId) {
        const job = await ctx.db.system.get(call.endCallFnId);
        endTimes.push(job ? new Date(job.scheduledTime).getTime() : now);
      } else {
        endTimes.push(now);
      }
    }
    endTimes.sort((a, b) => a - b);
    // Simulate assigning each waiting session to earliest slot
    for (const session of waiting) {
      // Get earliest slot free time
      const slotTime = endTimes.shift()!;
      if (session._id === sessionId) {
        const waitMs = Math.max(0, slotTime - now);
        return Math.ceil(waitMs / (60 * 1000));
      }
      // Schedule this session's end
      endTimes.push(slotTime + MAX_SESSION_DURATION);
      endTimes.sort((a, b) => a - b);
    }
    // If not found in waiting list, estimate end of last slot
    const lastEnd = endTimes[endTimes.length - 1];
    const waitMs = Math.max(0, lastEnd - now);
    return Math.ceil(waitMs / (60 * 1000));
  },
});

/*
 * INTERNAL ACTIONS
 */

export const handleQueue = internalAction({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId,
    });
    if (!session) throw new Error("Session not found");
    if (!session.active && !session.inCall) {
      // Preserve original queuedAt; set only on initial enqueue
      const now = Date.now();
      const updateArgs: {
        sessionId: Id<"sessions">;
        active: boolean;
        queuedAt?: number;
      } = {
        sessionId: session._id,
        active: true,
      };
      if (session.queuedAt === undefined) {
        updateArgs.queuedAt = now;
      }
      await ctx.runMutation(internal.user.session.updateSession, updateArgs);
    }
    await ctx.runAction(internal.user.queue.processQueue, {});
    return null;
  },
});

export const processQueue = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const waiting: Doc<"sessions">[] = await ctx.runQuery(
      internal.user.queue.listWaitingSessions,
      {}
    );
    const inCalls: Doc<"sessions">[] = await ctx.runQuery(
      internal.user.queue.listActiveCalls,
      {}
    );
    if (inCalls.length < MAX_CONCURRENT_CALLS && waiting.length > 0) {
      await ctx.runAction(internal.user.queue.startCall, {
        sessionId: waiting[0]._id,
      });
    }
    return null;
  },
});

export const startCall = internalAction({
  args: { sessionId: v.id("sessions") },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    await ctx.runAction(internal.user.actions.generateSessionUrl, {
      sessionId,
    });
    const endCallFnId = await ctx.scheduler.runAfter(
      MAX_SESSION_DURATION,
      internal.user.queue.leaveQueue,
      { sessionId }
    );
    // Move session into an active call (no longer in queue)
    await ctx.runMutation(internal.user.session.updateSession, {
      sessionId,
      active: false,
      inCall: true,
      endCallFnId,
    });
    return null;
  },
});

export const leaveQueue = internalAction({
  args: {
    sessionId: v.id("sessions"),
    endCallFnId: v.optional(v.id("_scheduled_functions")),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, endCallFnId }) => {
    if (endCallFnId) {
      await ctx.scheduler.cancel(endCallFnId);
    }
    await ctx.runMutation(internal.user.session.updateSession, {
      sessionId,
      active: false,
      inCall: false,
      endCallFnId: null,
    });
    await ctx.runAction(internal.user.queue.processQueue, {});
    return null;
  },
});

export const nextUserInQueue = internalQuery({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx): Promise<Id<"users"> | null> => {
    const f = await ctx.runQuery(internal.user.queue.listWaitingSessions, {});
    if (f.length === 0) return null;
    return f[0].userId;
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
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    return session !== null && session.active;
  },
});
