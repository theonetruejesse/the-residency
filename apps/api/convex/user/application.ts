import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { MISSION } from "../schema";
import { Id, Doc } from "../_generated/dataModel";

// only exposed functions for the application

export const submitIntake = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    ...MISSION,
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
    const applicant = await ctx.runQuery(api.user.application.getApplicant, {
      userId: args.userId,
    });
    if (!applicant) throw new Error("Applicant not found");

    const { user, mission } = applicant;

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
export const joinCall = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");
    await ctx.db.patch(session._id, {
      active: true,
    });
  },
});

// creates the call url and update the session
export const createCall = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
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

export const endCall = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");
    await ctx.db.patch(session._id, {
      active: false,
    });
  },
});

// the only data that matters for evaluating applicants
export const getApplicant = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.id("users"),
        _creationTime: v.number(),
        firstName: v.string(),
        lastName: v.string(),
        round: v.string(),
        status: v.string(),
      }),
      mission: v.object({
        _id: v.id("missions"),
        _creationTime: v.number(),
        userId: v.id("users"),
        interest: v.string(),
        accomplishment: v.string(),
      }),
    }),
    v.null()
  ),
  handler: async (
    ctx,
    args
  ): Promise<{ user: Doc<"users">; mission: Doc<"missions"> } | null> => {
    const documentId = ctx.db.normalizeId("users", args.userId);
    if (!documentId) return null;

    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId: documentId,
    });
    const mission = await ctx.runQuery(internal.user.users.getMission, {
      userId: documentId,
    });

    if (!user || !mission) {
      console.error(`User or mission not found for documentId: ${documentId}`);
      return null;
    }

    return { user, mission };
  },
});
