import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      name: args.name,
    });
  },
});

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
    const user = await ctx.runQuery(api.users.getUser, {
      userId: args.userId,
    });

    if (!user) throw new Error("User not found");

    const tokenData = await ctx.runAction(internal.token.generateToken, {});

    await ctx.runMutation(internal.users.generateSession, {
      userId: args.userId,
      active: true,
      sessionId: tokenData.sessionId,
      sessionToken: tokenData.rtcToken,
      expiresAt: tokenData.expiresAt,
    });
  },
});

export const generateSession = internalMutation({
  args: {
    userId: v.id("users"),
    active: v.boolean(),
    sessionId: v.number(),
    sessionToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      ...args,
    });
  },
});
