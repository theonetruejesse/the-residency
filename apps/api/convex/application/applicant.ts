import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import {
  Applicants,
  Backgrounds,
  BasicInfo,
  Links,
  Missions,
  RANKING_OPTIONS,
  ROUND_OPTIONS,
  STATUS_OPTIONS,
} from "../model/applicants";
import { CURRENT_COHORT } from "../constants";
import { FullApplicantType, InterviewGrade } from "../types/application.types";
import { internal } from "../_generated/api";

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

export const getApplicantInterview = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", args.applicantId))
      .unique();

    if (!interview) return null;

    const grades = await ctx.db
      .query("grades")
      .withIndex("by_interviewId", (q) => q.eq("interviewId", interview._id))
      .collect();

    return {
      interview,
      grades,
    };
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

export const getFullApplicant = internalQuery({
  args: {
    includeInterview: v.boolean(),
    applicant: v.object({
      ...Applicants.withSystemFields,
    }),
  },
  handler: async (ctx, args): Promise<FullApplicantType> => {
    const {
      basicInfoId,
      missionId,
      backgroundId,
      linkId,
      status,
      round,
      ranking,
    } = args.applicant;
    const basicInfo = await ctx.db.get(basicInfoId);
    if (!basicInfo)
      throw new Error(`BasicInfo not found for applicant ${basicInfoId}`);

    const mission = await ctx.db.get(missionId);
    if (!mission)
      throw new Error(`Mission not found for applicant ${missionId}`);

    const background = await ctx.db.get(backgroundId);
    if (!background)
      throw new Error(`Background not found for applicant ${backgroundId}`);

    const links = await ctx.db.get(linkId);
    if (!links) throw new Error(`Links not found for applicant ${linkId}`);

    const decision = {
      status,
      round,
      ranking,
    };

    let interview: InterviewGrade | null = null;
    if (args.includeInterview) {
      interview = await ctx.runQuery(
        internal.application.applicant.getApplicantInterview,
        { applicantId: args.applicant._id }
      );
    }

    return {
      applicant: {
        id: args.applicant._id,
        decision,
        basicInfo,
        background,
        links,
        mission,
      },
      interview,
    };
  },
});
