// todo, auth admin and client endpoints using clerk

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  Backgrounds,
  Applicants,
  BasicInfo,
  RANKING_OPTIONS,
  ROUND_OPTIONS,
  STATUS_OPTIONS,
  Missions,
  Links,
} from "../model/applicants";
import { adminAction, adminQuery } from "../utils/wrappers";
import { paginationOptsValidator } from "convex/server";
import { CURRENT_COHORT } from "../constants";
import { internalQuery } from "../_generated/server";
import { FullApplicantType } from "../types/application.types";

// todo, send emails with resend
export const approveIntake = adminAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args): Promise<Id<"sessions">> => {
    // 1. update applicant round
    await ctx.runMutation(internal.application.applicant.updateApplicantRound, {
      applicantId: args.applicantId,
      round: "first_round",
    });

    // 2. fetch mission context
    const mission = await ctx.runQuery(
      internal.application.applicant.getApplicantMission,
      { applicantId: args.applicantId }
    );
    if (!mission) throw new Error("Mission not found");

    // 3. create session and generate content in parallel
    const [sessionId, { role, tagline }] = await Promise.all([
      ctx.runMutation(internal.application.session.createSession, {
        applicantId: args.applicantId,
        missionId: mission._id,
      }),
      ctx.runAction(internal.application.action.generateContent, {
        interest: mission.interest,
        accomplishment: mission.accomplishment,
      }),
    ]);

    // 4. create session persona and applicant user in parallel
    const [_, userId] = await Promise.all([
      ctx.runMutation(internal.application.session.createSessionPersona, {
        sessionId,
        role,
        tagline,
      }),
      ctx.runMutation(internal.application.user.createApplicantUser, {
        applicantId: args.applicantId,
      }),
    ]);

    // 5. invite applicant user and set applicant user id in parallel
    await Promise.all([
      ctx.runAction(internal.application.action.inviteApplicantUser, {
        userId,
      }),
      ctx.runMutation(internal.application.applicant.setApplicantUserId, {
        applicantId: args.applicantId,
        userId,
      }),
    ]);

    return sessionId;
  },
});

export const inviteAdmin = adminAction({
  args: v.object({
    basicInfo: BasicInfo.table.validator,
  }),
  handler: async (ctx, args) => {
    const { basicInfo } = args;
    const userId = await ctx.runMutation(
      internal.application.user.createAdminUser,
      { basicInfo }
    );

    await ctx.runAction(internal.application.action.inviteAdmin, {
      userId,
      email: basicInfo.email,
    });
  },
});

// todo, send emails with resend
export const rejectApplicant = adminAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "rejected",
      }
    );
  },
});

export const waitlistApplicant = adminAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "waitlisted",
      }
    );
  },
});

// QUERIES

export const intakeApplicants = adminQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("applicants")
      .withIndex("by_cycle", (q) =>
        q
          .eq("cohort", CURRENT_COHORT)
          .eq("round", "intake")
          .eq("status", "pending")
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const fullApplicants: FullApplicantType[] = await Promise.all(
      result.page.map(async (applicant) => {
        return await ctx.runQuery(internal.application.admin.getFullApplicant, {
          applicant,
        });
      })
    );

    return {
      page: fullApplicants,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getFullApplicant = internalQuery({
  args: {
    applicant: v.object({
      ...Applicants.withSystemFields,
    }),
  },
  returns: {
    id: v.id("applicants"),
    decision: v.object({
      status: STATUS_OPTIONS,
      round: ROUND_OPTIONS,
      ranking: RANKING_OPTIONS,
    }),
    basicInfo: v.object({
      ...BasicInfo.withSystemFields,
    }),
    background: v.object({
      ...Backgrounds.withSystemFields,
    }),
    links: v.object({
      ...Links.withSystemFields,
    }),
    mission: v.object({
      ...Missions.withSystemFields,
    }),
  },
  handler: async (ctx, args) => {
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

    return {
      id: args.applicant._id,
      decision,
      basicInfo,
      background,
      links,
      mission,
    };
  },
});
