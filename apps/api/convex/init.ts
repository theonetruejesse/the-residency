// seed the database

import { internalMutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const seedUsers = [
  { firstName: "Arya", lastName: "Kumar", round: "intake", status: "pending" },
  { firstName: "John", lastName: "Doe", round: "intake", status: "pending" },
  { firstName: "Evelyn", lastName: "Li", round: "intake", status: "pending" },
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
