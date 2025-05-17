import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { BasicInfo } from "../model/applicants";

export const createUser = internalMutation({
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
      role: "resident",
    });
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
