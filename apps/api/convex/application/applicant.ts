import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import { BasicInfo, ROUND_OPTIONS, STATUS_OPTIONS } from "../model/applicants";
import { CURRENT_COHORT } from "../constants";

export const createApplicant = internalMutation({
  args: v.object({
    basicInfoId: v.id("basicInfo"),
    missionId: v.id("missions"),
    backgroundId: v.id("backgrounds"),
    linkId: v.id("links"),
  }),
  returns: v.id("applicants"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("applicants", {
      ...args,
      status: "pending",
      ranking: "neutral",
      round: "intake",
      cohort: CURRENT_COHORT,
    });
  },
});

export const updateApplicantRound = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    round: ROUND_OPTIONS,
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.applicantId, {
      round: args.round,
    });
  },
});

export const updateApplicantStatus = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    status: STATUS_OPTIONS,
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.applicantId, {
      status: args.status,
    });
  },
});

export const getApplicant = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.applicantId);
  },
});

export const getApplicantBasicInfo = internalQuery({
  args: { applicantId: v.id("applicants") },
  returns: BasicInfo.table.validator,
  handler: async (ctx, args) => {
    const applicant = await ctx.db.get(args.applicantId);
    if (!applicant) throw new Error("Applicant not found");
    const basicInfo = await ctx.db.get(applicant.basicInfoId);
    if (!basicInfo) throw new Error("Basic info not found");

    return basicInfo;
  },
});

export const getApplicantMission = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    const applicant = await ctx.db.get(args.applicantId);
    if (!applicant) throw new Error("Applicant not found");
    const mission = await ctx.db.get(applicant.missionId);
    if (!mission) throw new Error("Mission not found");

    return mission;
  },
});

export const getApplicantSession = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", args.applicantId))
      .unique();
  },
});

export const setApplicantUserId = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.applicantId, {
      userId: args.userId,
    });
  },
});
