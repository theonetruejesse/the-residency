import { Infer, v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  BasicInfo,
  RANKING_OPTIONS,
  ROUND_OPTIONS,
  STATUS_OPTIONS,
} from "../model/applicants";
import { adminAction, adminMutation, adminQuery } from "../utils/wrappers";
import { paginationOptsValidator } from "convex/server";
import { CURRENT_COHORT } from "../constants";
import { internalAction } from "../_generated/server";
import type { FullApplicantType } from "../types/application.types";

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

export const approveRound = adminAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    const { applicantId } = args;
    const applicant = await ctx.runQuery(
      internal.application.applicant.getApplicant,
      { applicantId }
    );
    if (!applicant) throw new Error("Applicant not found");

    const { round } = applicant;

    switch (round) {
      case "intake":
        await ctx.runAction(internal.application.admin.approveIntake, {
          applicantId: args.applicantId,
        });
        break;
      case "first_round":
        await ctx.runAction(internal.application.admin.approveFirstRound, {
          applicantId: args.applicantId,
        });
        break;
      case "second_round":
        await ctx.runAction(internal.application.admin.approveSecondRound, {
          applicantId: args.applicantId,
        });
        break;
    }
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

// todo, send emails with resend
export const approveIntake = internalAction({
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

// todo, send emails with resend
export const approveFirstRound = internalAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.application.applicant.updateApplicantRound, {
      applicantId: args.applicantId,
      round: "second_round",
    });
  },
});

// TODO send email
export const approveSecondRound = internalAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(
      internal.application.applicant.updateApplicantStatus,
      {
        applicantId: args.applicantId,
        status: "accepted",
      }
    );
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
