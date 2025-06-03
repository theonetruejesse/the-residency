import { Infer, v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  BasicInfo,
  RANKING_OPTIONS,
  ROUND_OPTIONS,
  STATUS_OPTIONS,
} from "../model/applicants";
import { adminMutation, adminQuery } from "../utils/wrappers";
import { paginationOptsValidator } from "convex/server";
import { CURRENT_COHORT } from "../constants";
import { internalMutation } from "../_generated/server";
import type { FullApplicantType } from "../types/application.types";

export const rejectApplicant = adminMutation({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { basicInfo } = await ctx.runQuery(
      internal.application.applicant.getApplicantBasicInfo,
      { applicantId: args.applicantId }
    );
    if (!basicInfo) throw new Error("Basic info not found");

    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "rejected",
      }
    );

    await ctx.scheduler.runAfter(0, internal.application.emails.sendEmail, {
      email: basicInfo.email,
      name: basicInfo.firstName,
      emailType: "rejection",
    });

    return null;
  },
});

export const waitlistApplicant = adminMutation({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { basicInfo } = await ctx.runQuery(
      internal.application.applicant.getApplicantBasicInfo,
      { applicantId: args.applicantId }
    );
    if (!basicInfo) throw new Error("Basic info not found");

    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "waitlisted",
      }
    );

    await ctx.scheduler.runAfter(0, internal.application.emails.sendEmail, {
      email: basicInfo.email,
      name: basicInfo.firstName,
      emailType: "waitlist",
    });

    return null;
  },
});

export const approveRound = adminMutation({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { applicantId } = args;
    const { applicant, basicInfo } = await ctx.runQuery(
      internal.application.applicant.getApplicantBasicInfo,
      { applicantId }
    );

    const { round } = applicant;
    const { email, firstName } = basicInfo;

    switch (round) {
      case "intake":
        await ctx.runMutation(internal.application.admin.approveIntake, {
          applicantId: args.applicantId,
          name: firstName,
          email,
        });
        break;
      case "first_round":
        await ctx.runMutation(internal.application.admin.approveFirstRound, {
          applicantId: args.applicantId,
          name: firstName,
          email,
        });
        break;
      case "second_round":
        await ctx.runMutation(internal.application.admin.approveSecondRound, {
          applicantId: args.applicantId,
        });
        break;
    }
    return null;
  },
});

export const approveIntake = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    name: v.string(),
    email: v.string(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args): Promise<Id<"sessions">> => {
    const { applicantId } = args;

    await ctx.runMutation(internal.application.applicant.updateApplicantRound, {
      applicantId,
      round: "first_round",
    });

    const userId = await ctx.runMutation(
      internal.application.user.createApplicantUser,
      { applicantId }
    );
    await ctx.runMutation(internal.application.applicant.setApplicantUserId, {
      applicantId,
      userId,
    });

    const mission = await ctx.runQuery(
      internal.application.applicant.getApplicantMission,
      { applicantId }
    );
    if (!mission) throw new Error("Mission not found");

    const sessionId = await ctx.runMutation(
      internal.application.session.createSession,
      {
        applicantId,
        missionId: mission._id,
      }
    );

    await ctx.scheduler.runAfter(
      0,
      internal.application.session.createSessionPersona,
      {
        sessionId,
        interest: mission.interest,
        accomplishment: mission.accomplishment,
      }
    );
    await ctx.scheduler.runAfter(
      0,
      internal.application.action.inviteApplicantUser,
      { userId }
    );
    await ctx.scheduler.runAfter(0, internal.application.emails.sendEmail, {
      email: args.email,
      name: args.name,
      emailType: "to-first",
    });

    return sessionId;
  },
});

export const approveFirstRound = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    name: v.string(),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.application.applicant.updateApplicantRound, {
      applicantId: args.applicantId,
      round: "second_round",
    });

    await ctx.scheduler.runAfter(0, internal.application.emails.sendEmail, {
      email: args.email,
      name: args.name,
      emailType: "to-second",
    });

    return null;
  },
});

export const approveSecondRound = internalMutation({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "accepted",
      }
    );

    return null;
  },
});

export const inviteAdmin = adminMutation({
  args: v.object({
    basicInfo: BasicInfo.table.validator,
  }),
  returns: v.null(),
  handler: async (ctx, args) => {
    const { basicInfo } = args;

    const userId = await ctx.runMutation(
      internal.application.user.createAdminUser,
      { basicInfo }
    );

    await ctx.scheduler.runAfter(0, internal.application.action.inviteAdmin, {
      userId,
      email: basicInfo.email,
    });

    return null;
  },
});

// QUERIES

const cycleQuery = (
  round: Infer<typeof ROUND_OPTIONS>,
  includeInterview: boolean
) => {
  return adminQuery({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      const result = await ctx.db
        .query("applicants")
        .withIndex("by_cycle", (q) =>
          q
            .eq("cohort", CURRENT_COHORT)
            .eq("round", round)
            .eq("status", "pending")
        )
        .order("desc")
        .paginate(args.paginationOpts);

      const page: FullApplicantType[] = await Promise.all(
        result.page.map(async (applicant) => {
          return await ctx.runQuery(
            internal.application.applicant.getFullApplicant,
            {
              includeInterview,
              applicant,
            }
          );
        })
      );

      return {
        page,
        isDone: result.isDone,
        continueCursor: result.continueCursor,
      };
    },
  });
};

export const intakeApplicants = cycleQuery("intake", false);
export const firstRoundApplicants = cycleQuery("first_round", true);
export const secondRoundApplicants = cycleQuery("second_round", true);

const statusQuery = (status: Infer<typeof STATUS_OPTIONS>) => {
  return adminQuery({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      const result = await ctx.db
        .query("applicants")
        .withIndex("by_status", (q) =>
          q.eq("cohort", CURRENT_COHORT).eq("status", status)
        )
        .order("desc")
        .paginate(args.paginationOpts);

      const page: FullApplicantType[] = await Promise.all(
        result.page.map(async (applicant) => {
          return await ctx.runQuery(
            internal.application.applicant.getFullApplicant,
            {
              includeInterview: true,
              applicant,
            }
          );
        })
      );

      return {
        page,
        isDone: result.isDone,
        continueCursor: result.continueCursor,
      };
    },
  });
};

export const acceptedApplicants = statusQuery("accepted");
export const rejectedApplicants = statusQuery("rejected");
export const waitlistedApplicants = statusQuery("waitlisted");

// naive implementation; use aggregate if really needed to scale
export const totalCount = adminQuery({
  args: {
    opt: v.union(STATUS_OPTIONS, ROUND_OPTIONS),
  },
  handler: async (ctx, args) => {
    let result = [];

    //not really a high maintainable way but it works
    const statuses = ["pending", "waitlisted", "accepted", "rejected"];
    if (statuses.includes(args.opt)) {
      result = await ctx.db
        .query("applicants")
        .withIndex("by_status", (q) =>
          q
            .eq("cohort", CURRENT_COHORT)
            .eq("status", args.opt as Infer<typeof STATUS_OPTIONS>)
        )
        .collect();
    } else {
      result = await ctx.db
        .query("applicants")
        .withIndex("by_cycle", (q) =>
          q
            .eq("cohort", CURRENT_COHORT)
            .eq("round", args.opt as Infer<typeof ROUND_OPTIONS>)
            .eq("status", "pending")
        )
        .collect();
    }
    return result.length;
  },
});

export const setApplicantRanking = adminMutation({
  args: {
    applicantId: v.id("applicants"),
    ranking: RANKING_OPTIONS,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicantId, {
      ranking: args.ranking,
    });
  },
});

// NOTE MUTATIONS

export const createNote = adminMutation({
  args: {
    applicantId: v.id("applicants"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = ctx.user._id;
    await ctx.runMutation(internal.application.applicant.createApplicantNote, {
      applicantId: args.applicantId,
      note: args.note,
      createdBy: adminId,
    });
  },
});

export const editNote = adminMutation({
  args: {
    noteId: v.id("notes"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = ctx.user._id;
    const note = await ctx.db.get(args.noteId);

    if (!note) throw new Error("Note not found");
    if (note.createdBy !== adminId) return;

    await ctx.runMutation(internal.application.applicant.updateApplicantNote, {
      noteId: args.noteId,
      note: args.note,
    });
  },
});

export const deleteNote = adminMutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.application.applicant.deleteApplicantNote, {
      noteId: args.noteId,
    });
  },
});
