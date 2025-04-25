import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { query, action, internalMutation } from "../_generated/server";

export const getSession = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createSession = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.user.users.getUser, {
      userId: args.userId,
    });

    if (!user) throw new Error("User not found");

    const sessionData = await ctx.runAction(
      internal.user.actions.generateSessionUrl,
      {}
    );

    if (!sessionData.sessionUrl)
      throw new Error("Failed to generate session URL");

    await ctx.runMutation(internal.user.session.generateSession, {
      userId: args.userId,
      active: true,
      sessionUrl: sessionData.sessionUrl,
    });
  },
});

export const generateSession = internalMutation({
  args: {
    userId: v.id("users"),
    active: v.boolean(),
    sessionUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      ...args,
    });
  },
});
