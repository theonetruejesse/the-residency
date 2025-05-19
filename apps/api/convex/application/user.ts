import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { BasicInfo } from "../model/applicants";
import { Users } from "../model/users";
import type { Doc } from "../_generated/dataModel";

export const createApplicantUser = internalMutation({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const applicant = await ctx.db.get(args.applicantId);
    if (!applicant) throw new Error("Applicant not found");

    return await ctx.db.insert("users", {
      basicInfoId: applicant.basicInfoId,
      missionId: applicant.missionId,
      backgroundId: applicant.backgroundId,
      linkId: applicant.linkId,
      role: "applicant",
    });
  },
});

export const createAdminUser = internalMutation({
  args: {
    basicInfo: BasicInfo.table.validator,
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const basicInfoId = await ctx.db.insert("basicInfo", {
      ...args.basicInfo,
    });

    const userId = await ctx.db.insert("users", {
      role: "admin",
      basicInfoId,
    });

    return userId;
  },
});

export const getUserByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(Users.table.validator, v.null()),
  handler: async (ctx, args) => {
    const user: Doc<"users"> | null = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

export const getUserBasicInfo = internalQuery({
  args: { userId: v.id("users") },
  returns: BasicInfo.table.validator,
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    const basicInfo = await ctx.db.get(user.basicInfoId);
    if (!basicInfo) throw new Error("Basic info not found");

    return basicInfo;
  },
});
