// seed the database

import { internalMutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const seedUsers = [
  { name: "Omar", tokenIdentifier: "user_omar", active: true },
  { name: "Arya", tokenIdentifier: "user_arya", active: true },
  { name: "Evelyn", tokenIdentifier: "user_evelyn", active: true },
] as const;

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    // If this project already has a populated database, do nothing
    const anyUser = await ctx.db.query("users").first();
    if (anyUser) return null;

    // If not, insert each of the seed users
    for (const user of seedUsers) {
      await ctx.db.insert("users", user);
    }

    return null;
  },
});
