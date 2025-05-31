import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { MAX_CONCURRENT_CALLS, MAX_SESSION_DURATION } from "../constants";
import { Doc } from "../_generated/dataModel";

// --- Queries ---

export const listActiveCalls = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_inCall", (q) => q.eq("inCall", true))
      .order("asc")
      .collect();
  },
});

export const listWaitingSessions = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"sessions">[]> => {
    // Return queued sessions in order of original queue time
    return await ctx.db
      .query("sessions")
      .withIndex("by_waiting_queuedAt", (q) => q.eq("waiting", true))
      .order("asc")
      .collect();
  },
});

export const isQueueFull = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx): Promise<boolean> => {
    const activeCalls = await ctx.runQuery(
      internal.application.queue.listActiveCalls,
      {}
    );
    return activeCalls.length >= MAX_CONCURRENT_CALLS;
  },
});

// --- Controllers ---

export const handleJoin = internalAction({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.runQuery(
      internal.application.session.getSession,
      {
        sessionId,
      }
    );
    if (!session) throw new Error("Session not found");
    if (session.sessionUrl || session.inCall) return null; // shouldnt handle queue after interview

    const waiting: Doc<"sessions">[] = await ctx.runQuery(
      internal.application.queue.listWaitingSessions,
      {}
    );

    if (waiting.length > 0) {
      await ctx.runMutation(internal.application.queue.joinQueue, {
        sessionId: session._id,
      });
    } else {
      await ctx.runAction(internal.application.queue.joinCall, {
        sessionId: session._id,
      });
    }
  },
});

export const joinQueue = internalMutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(internal.application.session.updateSession, {
      sessionId,
      waiting: true,
      inCall: false,
      queuedAt: Date.now(),
    });
  },
});

export const joinCall = internalAction({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    try {
      // schedule the end of the call
      const scheduledEndTime = Date.now() + MAX_SESSION_DURATION;
      const endCallFnId = await ctx.scheduler.runAt(
        new Date(scheduledEndTime),
        internal.application.queue.scheduledLeave,
        { sessionId }
      );

      const sessionUrl = await ctx.runAction(
        internal.application.action.generateSessionUrl,
        {}
      );

      // Mark the session as an active call
      await ctx.runMutation(internal.application.session.updateSession, {
        sessionId,
        waiting: false,
        inCall: true,
        endCallFnId,
        scheduledEndTime,
        sessionUrl,
      });

      return null;
    } catch (error) {
      console.error(`Error in joinCall for session ${sessionId}:`, error);
      throw error;
    }
  },
});

export const startNextCall = internalAction({
  args: {},
  handler: async (ctx) => {
    const waiting: Doc<"sessions">[] = await ctx.runQuery(
      internal.application.queue.listWaitingSessions,
      {}
    );
    if (waiting.length > 0) {
      await ctx.runAction(internal.application.queue.joinCall, {
        sessionId: waiting[0]!._id,
      });
    }
    return null;
  },
});

export const scheduledLeave = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(internal.application.queue.leaveQueue, {
      sessionId,
    });
    await ctx.runAction(internal.application.queue.startNextCall, {});
    return null;
  },
});

export const handleLeave = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.runQuery(
      internal.application.session.getSession,
      { sessionId }
    );
    if (!session) throw new Error("Session not found");

    // If the session was in a call and had a scheduled end function, cancel it
    if (session.inCall && session.endCallFnId) {
      await ctx.scheduler.cancel(session.endCallFnId);
    }

    // Update session to reflect leaving fully
    await ctx.runMutation(internal.application.queue.leaveQueue, {
      sessionId,
    });

    // Trigger queue processing to potentially start the next call
    await ctx.runAction(internal.application.queue.startNextCall, {});
    return null;
  },
});

export const leaveQueue = internalMutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(internal.application.session.updateSession, {
      sessionId,
      waiting: false,
      inCall: false,
      endCallFnId: null,
      scheduledEndTime: null,
      queuedAt: null,
    });
  },
});
