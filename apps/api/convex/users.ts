import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { generateUserId } from "./helpers/utils";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab all users
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const getUser = query({
  args: { userId: v.number() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    return user;
  },
});

export const createUser = mutation({
  args: { name: v.string(), userId: v.optional(v.number()) },
  handler: async (ctx, { name, userId }) => {
    const id = userId ?? generateUserId();
    await ctx.db.insert("users", { name, userId: id });
  },
});

// export const createSession = mutation({
//   args: { userId: v.number() },
//   handler: async (ctx, { userId }) => {},
// });
