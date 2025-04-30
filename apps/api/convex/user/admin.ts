// todo, auth admin and client endpoints using clerk

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// approving applicant for the first round; todo, update later to handle rejections
export const approveIntake = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Doc<"sessions">> => {
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

    // return session for the flow; port to different setup later
    const session = await ctx.runQuery(internal.user.users.getUserSession, {
      userId: args.userId,
    });
    if (!session) throw new Error("Session not found");
    return session;
  },
});
