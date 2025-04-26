import { v } from "convex/values";
import { query, internalMutation } from "../_generated/server.js";
import { ROUNDS, STATUSES } from "../schema.js";

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
