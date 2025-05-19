// todo, auth admin and client endpoints using clerk

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { BasicInfo } from "../model/applicants";
import { adminAction, adminQuery } from "../utils/wrappers";
import { paginationOptsValidator } from "convex/server";
import { CURRENT_COHORT } from "../constants";

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

export const listApplicants = adminQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("applicants")
      .withIndex("by_cohort", (q) => q.eq("cohort", CURRENT_COHORT))
      .order("desc")
      .paginate(args.paginationOpts);

    const fullApplicants = await Promise.all(
      result.page.map(async (applicant) => {
        const {
          _id,
          _creationTime,
          basicInfoId,
          missionId,
          backgroundId,
          linkId,
          ...applicantData
        } = applicant;

        const basicInfoDoc = await ctx.db.get(basicInfoId);
        if (!basicInfoDoc)
          throw new Error(`BasicInfo not found for applicant ${_id}`);
        const {
          _id: biId,
          _creationTime: biCreationTime,
          ...basicInfo
        } = basicInfoDoc;

        const missionDoc = await ctx.db.get(missionId);
        if (!missionDoc)
          throw new Error(`Mission not found for applicant ${_id}`);
        const {
          _id: mId,
          _creationTime: mCreationTime,
          ...mission
        } = missionDoc;

        const backgroundDoc = await ctx.db.get(backgroundId);
        if (!backgroundDoc)
          throw new Error(`Background not found for applicant ${_id}`);
        const {
          _id: bgId,
          _creationTime: bgCreationTime,
          ...background
        } = backgroundDoc;

        const linksDoc = await ctx.db.get(linkId);
        if (!linksDoc) throw new Error(`Links not found for applicant ${_id}`);
        const { _id: lId, _creationTime: lCreationTime, ...links } = linksDoc;

        const decision = {
          status: applicantData.status,
          round: applicantData.round,
          ranking: applicantData.ranking,
        };

        return {
          id: _id,
          decision,
          basicInfo,
          mission,
          background,
          links,
        };
      })
    );

    return {
      page: fullApplicants,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
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
