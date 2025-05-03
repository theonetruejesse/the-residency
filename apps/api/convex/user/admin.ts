// todo, auth admin and client endpoints using clerk

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// approving applicant for the first round; todo, update later to handle rejections
// todo, auth admin and client endpoints using clerk
export const approveIntake = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Id<"sessions">> => {
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
      }
    );

    await ctx.runMutation(internal.user.session.createSessionPersona, {
      sessionId,
      role,
      tagline,
    });

    return sessionId;
  },
});

// helpers for demo

export const kickSession = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.user.queue.handleLeave, {
      sessionId: args.sessionId,
    });
  },
});
