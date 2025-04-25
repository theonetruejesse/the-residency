import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { MISSIONS } from "../schema";

// only exposed mutation for creating a user

export const intakeForm = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    ...MISSIONS,
  },
  handler: async (ctx, args) => {
    const userId = await ctx.runMutation(internal.user.users.createUser, {
      firstName: args.firstName,
      lastName: args.lastName,
      round: "intake",
      status: "pending",
    });

    // no promise.all necessary, since convex batch mutations automatically

    await ctx.db.insert("missions", {
      userId: userId,
      interest: args.interest,
      accomplishment: args.accomplishment,
    });

    // todo, rest of the intake form
  },
});
