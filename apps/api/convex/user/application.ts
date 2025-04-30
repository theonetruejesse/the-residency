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

// approving applicant for the first round; todo, update later to handle rejections
export const approveIntake = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId: args.userId,
    });
    const mission = await ctx.runQuery(internal.user.users.getUserMission, {
      userId: args.userId,
    });
    if (!user || !mission) throw new Error("User or mission not found");

    await ctx.runMutation(internal.user.users.updateUser, {
      userId: user._id,
      status: user.status,
      round: "first_round",
    });

    const { firstQuestion, role, tagline } = await ctx.runAction(
      internal.user.actions.generateContent,
      {
        interest: mission.interest,
        accomplishment: mission.accomplishment,
      }
    );

    const sessionId = await ctx.runMutation(
      internal.user.session.createSession,
      {
        userId: user._id,
        missionId: mission._id,
        firstQuestion: firstQuestion,
        active: false,
      }
    );

    await ctx.runMutation(internal.user.session.createSessionPersona, {
      sessionId,
      role,
      tagline,
    });
  },
});

// we either join the queue or join the call; this function handles both
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
      sessionId: userSession._id,
      userId,
    });
  },
});

// remove user from the active call list
export const endCall = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId,
    });
    if (!session) throw new Error("Session not found");

    await ctx.runMutation(internal.user.queue.leaveQueue, {
      sessionId: session._id,
      endCallFnId: session.endCallFnId,
    });
  },
});

// QUERIES
export const getApplicant = query({
  args: {
    userId: v.string(),
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
    const documentId = ctx.db.normalizeId("users", args.userId);
    if (!documentId) return null;

    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId: documentId,
    });
    const mission = await ctx.runQuery(internal.user.users.getUserMission, {
      userId: documentId,
    });
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: documentId,
    });

    if (!user || !mission || !session) {
      console.error(
        `User or mission or session not found for documentId: ${documentId}`
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

    const { active, sessionUrl } = userSession;

    if (active && sessionUrl) return "active_call";
    if (active && !sessionUrl) return "in_queue";
    if (!active && sessionUrl) return "post_interview";

    // else: if (!active && !sessionUrl)
    const isQueueFull: boolean = await ctx.runQuery(
      internal.user.queue.isQueueFull
    );
    return isQueueFull ? "join_queue" : "join_call";
  },
});

// returns all active sessions, personas
export const getWaitingList = query({
  args: {},
  returns: v.array(
    v.object({
      sessionId: v.id("sessions"),
      role: v.string(),
      tagline: v.string(),
      waitTime: v.number(),
    })
  ),
  handler: async (
    ctx
  ): Promise<
    {
      sessionId: Id<"sessions">;
      role: string;
      tagline: string;
      waitTime: number;
    }[]
  > => {
    const sessions = await ctx.runQuery(internal.user.queue.listQueueSessions);

    return await Promise.all(
      sessions.map(async (session) => {
        const persona: Doc<"personas"> | null = await ctx.runQuery(
          internal.user.session.getSessionPersona,
          { sessionId: session._id }
        );
        if (!persona)
          throw new Error(`No persona found for session ${session._id}`);

        // Fetch estimated wait time for this session
        const waitTime: number = await ctx.runQuery(
          internal.user.queue.getSessionWaitTime,
          { sessionId: session._id }
        );
        return {
          sessionId: session._id,
          role: persona.role,
          tagline: persona.tagline,
          waitTime,
        };
      })
    );
  },
});
