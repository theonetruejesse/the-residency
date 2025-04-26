import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { MISSION } from "../schema";
import { Id, Doc } from "../_generated/dataModel";

// only exposed mutation for creating a user

export const submitIntake = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    ...MISSION,
  },
  returns: v.id("users"),
  handler: async (ctx, args): Promise<Id<"users">> => {
    const userId: Id<"users"> = await ctx.runMutation(
      internal.user.users.createUser,
      {
        firstName: args.firstName,
        lastName: args.lastName,
        round: "intake",
        status: "pending",
      }
    );

    // no promise.all necessary, since convex batch mutations automatically

    await ctx.db.insert("missions", {
      userId: userId,
      interest: args.interest,
      accomplishment: args.accomplishment,
    });

    // todo, rest of the intake form

    return userId;
  },
});

// the only data that matters for evaluating applicants
export const getApplicant = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.id("users"),
        _creationTime: v.number(),
        firstName: v.string(),
        lastName: v.string(),
        round: v.string(),
        status: v.string(),
      }),
      mission: v.object({
        _id: v.id("missions"),
        _creationTime: v.number(),
        userId: v.id("users"),
        interest: v.string(),
        accomplishment: v.string(),
      }),
    }),
    v.null()
  ),
  handler: async (
    ctx,
    args
  ): Promise<{ user: Doc<"users">; mission: Doc<"missions"> } | null> => {
    const documentId = ctx.db.normalizeId("users", args.userId);
    if (!documentId) return null;

    const user = await ctx.runQuery(internal.user.users.getUser, {
      userId: documentId,
    });
    const mission = await ctx.runQuery(internal.user.users.getMission, {
      userId: documentId,
    });

    if (!user || !mission) {
      console.error(`User or mission not found for documentId: ${documentId}`);
      return null;
    }

    return { user, mission };
  },
});
