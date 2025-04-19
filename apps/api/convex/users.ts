import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab all users
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const create = mutation({
  args: { name: v.string(), tokenIdentifier: v.string(), active: v.boolean() },
  handler: async (ctx, { name, tokenIdentifier, active }) => {
    // Create a new user
    await ctx.db.insert("users", { name, tokenIdentifier, active });
  },
});
