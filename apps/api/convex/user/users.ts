import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";
import { ROUNDS_OPTIONS, STATUSES_OPTIONS } from "../schema.types";

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserMission = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("missions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getUserSession = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createUser = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    round: ROUNDS_OPTIONS,
    status: STATUSES_OPTIONS,
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      round: args.round,
      status: args.status,
    });
  },
});

// update the user's status
export const updateUser = internalMutation({
  args: {
    userId: v.id("users"),
    round: ROUNDS_OPTIONS,
    status: STATUSES_OPTIONS,
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      status: args.status,
      round: args.round,
    });
  },
});
