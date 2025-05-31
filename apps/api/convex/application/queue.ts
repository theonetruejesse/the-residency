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
    // IMPROVEMENT: More comprehensive capacity checking
    const activeCalls = await ctx.runQuery(
      internal.application.queue.listActiveCalls,
      {}
    );

    // Check if we're at or near capacity
    if (activeCalls.length >= MAX_CONCURRENT_CALLS) {
      return true;
    }

    // IMPROVEMENT: Also consider if there are people waiting
    // This aligns with the backend logic that queues new users if anyone is waiting
    const waiting = await ctx.runQuery(
      internal.application.queue.listWaitingSessions,
      {}
    );

    // If people are waiting, new users should be queued regardless of capacity
    // This ensures fairness and aligns with handleJoin logic
    return waiting.length > 0;
  },
});

// --- Controllers ---

export const handleJoin = internalAction({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.runQuery(
      internal.application.session.getSession,
      { sessionId }
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
    // IMPROVEMENT: Ensure queuedAt is always set to prevent null ordering issues
    const queuedAt = Date.now();

    await ctx.runMutation(internal.application.session.updateSession, {
      sessionId,
      waiting: true,
      inCall: false,
      queuedAt,
    });
  },
});

export const joinCall = internalAction({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    try {
      // CRITICAL FIX: Add capacity validation first
      const activeCalls = await ctx.runQuery(
        internal.application.queue.listActiveCalls,
        {}
      );
      if (activeCalls.length >= MAX_CONCURRENT_CALLS) {
        // Queue the session instead of joining call
        await ctx.runMutation(internal.application.queue.joinQueue, {
          sessionId,
        });
        return null;
      }

      // IMPROVEMENT: Generate session URL first (most likely to fail)
      const sessionUrl = await ctx.runAction(
        internal.application.action.generateSessionUrl,
        {}
      );

      // IMPROVEMENT: Schedule after URL generation to reduce orphaned scheduler risk
      const scheduledEndTime = Date.now() + MAX_SESSION_DURATION;
      let endCallFnId: any;

      try {
        endCallFnId = await ctx.scheduler.runAt(
          new Date(scheduledEndTime),
          internal.application.queue.scheduledLeave,
          { sessionId }
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
      } catch (updateError) {
        // CRITICAL FIX: Clean up scheduled function if session update fails
        if (endCallFnId) {
          try {
            await ctx.scheduler.cancel(endCallFnId);
          } catch (cancelError) {
            console.error(
              `Failed to cancel scheduled function ${endCallFnId}:`,
              cancelError
            );
          }
        }
        throw updateError;
      }
    } catch (error) {
      console.error(`Error in joinCall for session ${sessionId}:`, error);
      throw error;
    }
  },
});

export const startNextCall = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // CRITICAL FIX: Check capacity before processing queue
      const activeCalls = await ctx.runQuery(
        internal.application.queue.listActiveCalls,
        {}
      );
      if (activeCalls.length >= MAX_CONCURRENT_CALLS) {
        // No capacity available, don't process queue
        return null;
      }

      const waiting: Doc<"sessions">[] = await ctx.runQuery(
        internal.application.queue.listWaitingSessions,
        {}
      );

      if (waiting.length > 0) {
        const sessionToProcess = waiting[0]!;

        try {
          await ctx.runAction(internal.application.queue.joinCall, {
            sessionId: sessionToProcess._id,
          });
        } catch (error) {
          console.error(
            `Failed to process session ${sessionToProcess._id} in startNextCall:`,
            error
          );

          // CRITICAL FIX: Error recovery - try next session in queue
          // Remove the failed session from queue to prevent infinite blocking
          await ctx.runMutation(internal.application.queue.leaveQueue, {
            sessionId: sessionToProcess._id,
          });

          // Recursively try the next session (with depth limit to prevent infinite recursion)
          const remainingWaiting = await ctx.runQuery(
            internal.application.queue.listWaitingSessions,
            {}
          );
          if (
            remainingWaiting.length > 0 &&
            remainingWaiting.length < waiting.length
          ) {
            // Only retry if we successfully removed a session and there are more waiting
            await ctx.runAction(internal.application.queue.startNextCall, {});
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error in startNextCall:`, error);
      // Don't throw to prevent cascade failures
      return null;
    }
  },
});

export const scheduledLeave = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    try {
      // IMPROVEMENT: Add defensive check for session existence
      const session = await ctx.runQuery(
        internal.application.session.getSession,
        { sessionId }
      );

      if (!session) {
        console.warn(
          `scheduledLeave called for non-existent session: ${sessionId}`
        );
        return null;
      }

      if (!session.inCall) {
        console.warn(
          `scheduledLeave called for session not in call: ${sessionId}`
        );
        // Still try to clean up in case of inconsistent state
      }

      await ctx.runMutation(internal.application.queue.leaveQueue, {
        sessionId,
      });
      await ctx.runAction(internal.application.queue.startNextCall, {});
      return null;
    } catch (error) {
      console.error(`Error in scheduledLeave for session ${sessionId}:`, error);
      // Still try to start next call to prevent queue from getting stuck
      try {
        await ctx.runAction(internal.application.queue.startNextCall, {});
      } catch (startNextError) {
        console.error(
          `Failed to start next call after scheduledLeave error:`,
          startNextError
        );
      }
      return null;
    }
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
