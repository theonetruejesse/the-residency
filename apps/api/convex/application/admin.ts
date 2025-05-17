// todo, auth admin and client endpoints using clerk

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// approving applicant for the first round; todo, update later to handle rejections
// todo, auth admin and client endpoints using clerk

// approve applicant:
// 1. update applicant round
// 2. create session + persona
// 3. create user + clerk invite

export const approveIntake = action({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args): Promise<Id<"sessions">> => {
    // 1. update applicant round
    await ctx.runMutation(internal.application.applicant.updateApplicantRound, {
      applicantId: args.applicantId,
      round: "first_round",
    });

    // 2. create session + persona
    const mission = await ctx.runQuery(
      internal.application.applicant.getApplicantMission,
      { applicantId: args.applicantId }
    );
    if (!mission) throw new Error("Mission not found");

    const sessionId = await ctx.runMutation(
      internal.application.session.createSession,
      {
        applicantId: args.applicantId,
        missionId: mission._id,
      }
    );
    const { role, tagline } = await ctx.runAction(
      internal.application.action.generateContent,
      {
        interest: mission.interest,
        accomplishment: mission.accomplishment,
      }
    );

    await ctx.runMutation(internal.application.session.createSessionPersona, {
      sessionId,
      role,
      tagline,
    });

    // 3. create user + clerk invite
    const userId = await ctx.runMutation(internal.application.user.createUser, {
      applicantId: args.applicantId,
    });

    await ctx.runAction(internal.application.action.inviteUser, {
      userId,
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
    await ctx.runAction(internal.application.queue.handleLeave, {
      sessionId: args.sessionId,
    });
  },
});
