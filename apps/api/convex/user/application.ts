import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id, Doc } from "../_generated/dataModel";
import {
  INTERVIEW_STATUS_OPTIONS,
  MISSION_ARGS,
  MISSION_RETURN,
  SESSION_RETURN,
  USER_RETURN,
} from "../schema.types";

// client endpoints

// we use userIds so people can't just finesse the queue by knowing other users' sessionId

export const submitIntake = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    ...MISSION_ARGS,
  },
  returns: v.id("users"),
  handler: async (ctx, args): Promise<Id<"users">> => {
    const userId: Id<"users"> = await ctx.runMutation(
      internal.user.users.createUser,
      {
        firstName: args.firstName,
        lastName: args.lastName,
        round: "intake",
        status: "pending",
      }
    );

    // no promise.all necessary, since convex batch mutations automatically

    await ctx.db.insert("missions", {
      userId: userId,
      interest: args.interest,
      accomplishment: args.accomplishment,
    });

    // todo, rest of the intake form

    return userId;
  },
});

// we need to re-run this action when waiting list changes

// we either join the queue or join the call; this function handles both
// automatically re-runs when a user joins or leaves the queue
export const handleJoin = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const userSession = await ctx.runQuery(internal.user.users.getUserSession, {
      userId,
    });
    if (!userSession) throw new Error("User session not found");

    await ctx.runAction(internal.user.queue.handleQueue, {
      userId,
    });
  },
});

// remove user from the active call list or queue
export const handleLeave = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId,
    });
    if (!session) throw new Error("Session not found");

    await ctx.runAction(internal.user.queue.leaveQueue, {
      sessionId: session._id,
      endCallFnId: session.endCallFnId,
    });
  },
});

// QUERIES
export const getApplicant = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      user: USER_RETURN,
      mission: MISSION_RETURN,
      session: SESSION_RETURN,
    }),
    v.null()
  ),
  handler: async (
    ctx,
    args
  ): Promise<{
    user: Doc<"users">;
    mission: Doc<"missions">;
    session: Doc<"sessions">;
  } | null> => {
    const { userId } = args;

    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId,
    });
    const mission = await ctx.runQuery(internal.user.users.getUserMission, {
      userId,
    });
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId,
    });

    if (!user || !mission || !session) {
      console.error(
        `User or mission or session not found for userId: ${userId}`
      );
      return null;
    }

    return { user, mission, session };
  },
});

export const getInterviewStatus = query({
  args: {
    userId: v.id("users"),
  },
  returns: INTERVIEW_STATUS_OPTIONS,
  handler: async (
    ctx,
    args
  ): Promise<
    "active_call" | "in_queue" | "post_interview" | "join_queue" | "join_call"
  > => {
    const userSession = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: args.userId,
    });
    if (!userSession) throw new Error("User session not found");

    const { active, inCall, sessionUrl } = userSession;

    if (!active && sessionUrl) return "post_interview";
    if (inCall && sessionUrl) return "active_call";
    if (active) return "in_queue";

    const isQueueFull: boolean = await ctx.runQuery(
      internal.user.queue.isQueueFull
    );
    return isQueueFull ? "join_queue" : "join_call";
  },
});

// returns all waiting list members: sessions, personas
export const getWaitingList = query({
  args: {},
  returns: v.array(
    v.object({
      sessionId: v.id("sessions"),
      role: v.string(),
      tagline: v.string(),
    })
  ),
  handler: async (
    ctx
  ): Promise<
    {
      sessionId: Id<"sessions">;
      role: string;
      tagline: string;
    }[]
  > => {
    const sessions = await ctx.runQuery(
      internal.user.queue.listWaitingSessions
    );

    return await Promise.all(
      sessions.map(async (session) => {
        const persona: Doc<"personas"> | null = await ctx.runQuery(
          internal.user.session.getSessionPersona,
          { sessionId: session._id }
        );
        if (!persona)
          throw new Error(`No persona found for session ${session._id}`);

        return {
          sessionId: session._id,
          role: persona.role,
          tagline: persona.tagline,
        };
      })
    );
  },
});

// returns the max wait time for a session in the queue (in minutes)
export const getMaxWaitTime = query({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");

    const waitTime: number = await ctx.runQuery(
      internal.user.queue.getSessionWaitTime,
      { sessionId: session._id }
    );
    return waitTime;
  },
});

// check if userIdString is valid and return userId
// todo, hash the userId url param to make links more secure
export const userIdFromStr = query({
  args: { userIdString: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const documentId = ctx.db.normalizeId("users", args.userIdString);
    return documentId;
  },
});
