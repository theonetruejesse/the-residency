import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id, Doc } from "../_generated/dataModel";
import {
  MISSION_ARGS,
  MISSION_RETURN,
  SESSION,
  SESSION_RETURN,
  USER_RETURN,
} from "../schema.types";
import { MAX_ACTIVE_SESSIONS } from "../constants";

// client endpoints

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

// assume we are approving the intake; todo, update later
export const approveIntake = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId: args.userId,
    });
    const mission = await ctx.runQuery(internal.user.users.getMission, {
      userId: args.userId,
    });
    if (!user || !mission) throw new Error("User or mission not found");

    await ctx.runMutation(internal.user.users.updateUser, {
      userId: user._id,
      status: user.status,
      round: "first_round",
    });

    const generate = await ctx.runAction(
      internal.user.actions.generateFirstQuestion,
      {
        interest: mission.interest,
        accomplishment: mission.accomplishment,
      }
    );

    if (!generate.firstQuestion)
      throw new Error("Failed to generate first question");

    await ctx.runMutation(internal.user.session.createSession, {
      userId: user._id,
      missionId: mission._id,
      firstQuestion: generate.firstQuestion,
      active: false,
    });
  },
});

// creates the call url and update the session
export const joinCall = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const activeSessions = await ctx.runQuery(
      api.user.application.activeSessionsCount
    );
    if (activeSessions >= MAX_ACTIVE_SESSIONS) throw new Error("Wait in line");

    const session = await ctx.runQuery(internal.user.session.getSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");

    const sessionData = await ctx.runAction(
      internal.user.actions.generateSessionUrl,
      {}
    );

    if (!sessionData.sessionUrl)
      throw new Error("Failed to generate session URL");

    await ctx.runMutation(internal.user.session.updateSession, {
      sessionId: session._id,
      sessionUrl: sessionData.sessionUrl,
      active: true,
    });

    // todo, schedule to mark interview as inactive after 20 minutes
  },
});

// remove from the queue
export const endCall = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.user.session.getSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");
    await ctx.db.patch(session._id, {
      active: false,
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
    const mission = await ctx.runQuery(internal.user.users.getMission, {
      userId: documentId,
    });
    const session = await ctx.runQuery(internal.user.session.getSession, {
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

export const activeSessionsCount = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return sessions.length;
  },
});

export const getUserSession = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(SESSION_RETURN, v.null()),
  handler: async (ctx, args): Promise<Doc<"sessions"> | null> => {
    return await ctx.runQuery(internal.user.session.getSession, {
      userId: args.userId,
    });
  },
});
