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
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const documentId = ctx.db.normalizeId("users", args.userId);
    if (!documentId) return null;
    return await ctx.db.get(documentId);
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

    const sessionData = await ctx.runAction(
      internal.actions.generateSessionUrl,
      {}
    );

    if (!sessionData.sessionUrl)
      throw new Error("Failed to generate session URL");

    await ctx.runMutation(internal.users.generateSession, {
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
