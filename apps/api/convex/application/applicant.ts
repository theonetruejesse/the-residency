import { Infer, v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import {
  Applicants,
  CRITERIA_OPTIONS,
  GRADE_OPTIONS,
  Interviews,
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

// PATCHES

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

export const getUserApplicant = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applicants")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// GETS

export const getApplicant = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.applicantId);
  },
});

export const getApplicantBasicInfo = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    const applicant = await ctx.db.get(args.applicantId);
    if (!applicant) throw new Error("Applicant not found");
    const basicInfo = await ctx.db.get(applicant.basicInfoId);
    if (!basicInfo) throw new Error("Basic info not found");

    return { basicInfo, applicant };
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

    const applicantNotes = await ctx.runQuery(
      internal.application.applicant.getApplicantNotes,
      {
        applicantId: args.applicant._id,
      }
    );
    const notes = await Promise.all(
      applicantNotes.map(async (note) => {
        const { createdBy } = note;
        const user = await ctx.runQuery(
          internal.application.user.getUserBasicInfo,
          { userId: createdBy }
        );
        if (!user) throw new Error("User not found");
        return {
          ...note,
          creator: `${user.firstName} ${user.lastName}`,
        };
      })
    );

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
      notes,
    };
  },
});

// NOTES CRUD

export const createApplicantNote = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    createdBy: v.id("users"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      ...args,
    });
  },
});

export const updateApplicantNote = internalMutation({
  args: {
    noteId: v.id("notes"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.noteId, { note: args.note });
  },
});

export const getApplicantNotes = internalQuery({
  args: { applicantId: v.id("applicants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", args.applicantId))
      .collect();
  },
});

export const deleteApplicantNote = internalMutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.noteId);
  },
});

// INTERVIEW CRUD

export const setInterviewUrl = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, { audioUrl: args.audioUrl });
  },
});

export const createInterviewGrade = internalMutation({
  args: {
    interview: v.object({
      ...Interviews.withoutSystemFields,
    }),
    grades: v.array(
      v.object({
        rationale: v.string(),
        quote: v.string(),
        grade: GRADE_OPTIONS,
        criteria: CRITERIA_OPTIONS,
      })
    ),
  },
  handler: async (ctx, args) => {
    const { interview, grades } = args;
    const interviewId = await ctx.db.insert("interviews", {
      ...interview,
    });

    grades.forEach(async (grade) => {
      await ctx.db.insert("grades", {
        ...grade,
        interviewId,
      });
    });

    const score = calculateScore(grades);
    await ctx.db.patch(interviewId, { score });
  },
});

const calculateScore = (
  grades: Array<{
    rationale: string;
    quote: string;
    grade: Infer<typeof GRADE_OPTIONS>;
    criteria: Infer<typeof CRITERIA_OPTIONS>;
  }>
) => {
  // Configurable weights for each grade
  const gradeWeights = {
    high: 3,
    medium: 2,
    low: 1,
    unclear: 0, // excluded from calculations
  };

  // Configurable weights for each criteria
  const criteriaWeights = {
    mission: 1.5,
    intelligence: 1.2,
    vision: 1.0,
    traction: 1.3,
    determination: 1.1,
  };

  // Filter out unclear grades and calculate scores
  const validGrades = grades.filter((grade) => grade.grade !== "unclear");

  if (validGrades.length === 0) {
    return "0/0"; // No valid grades to evaluate
  }

  // Calculate actual points earned (grade weight * criteria weight)
  const actualPoints = validGrades.reduce((sum, grade) => {
    const gradeScore = gradeWeights[grade.grade];
    const criteriaMultiplier = criteriaWeights[grade.criteria];
    return sum + gradeScore * criteriaMultiplier;
  }, 0);

  // Calculate total possible points (max grade weight * criteria weight for each valid criteria)
  const totalPossiblePoints = validGrades.reduce((sum, grade) => {
    const maxGradeScore = gradeWeights.high;
    const criteriaMultiplier = criteriaWeights[grade.criteria];
    return sum + maxGradeScore * criteriaMultiplier;
  }, 0);

  // Round to 1 decimal place for cleaner display
  const roundedActual = Math.round(actualPoints * 10) / 10;
  const roundedTotal = Math.round(totalPossiblePoints * 10) / 10;

  return `${roundedActual}/${roundedTotal}`;
};
