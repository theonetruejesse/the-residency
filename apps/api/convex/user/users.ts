// internal queries and mutations for user data
// keep these internal to reduce chances of data leakage
// TODO: simple service-repo pattern

import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server.js";
import { ROUNDS, STATUSES } from "../schema.js";

// TODO: needs authentication
// export const listUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db.query("users").collect();
//   },
// });

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const documentId = ctx.db.normalizeId("users", args.userId);
    if (!documentId) return null;
    return await ctx.db.get(documentId);
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

export const getMission = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("missions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createUser = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    round: ROUNDS,
    status: STATUSES,
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
    status: STATUSES,
    round: ROUNDS,
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      status: args.status,
      round: args.round,
    });
  },
});
