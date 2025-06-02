import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { CRITERIA_OPTIONS, GRADE_OPTIONS } from "../model/applicants";

export const createInterviewGrade = internalMutation({
  args: {
    applicantId: v.id("applicants"),
    conversationId: v.string(),
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
    const { grades, applicantId, conversationId } = args;

    const interviewId = await ctx.db.insert("interviews", {
      applicantId,
      conversationId,
    });

    grades.forEach(async (grade) => {
      await ctx.db.insert("grades", {
        ...grade,
        interviewId,
      });
    });
  },
});

export const setInterviewUrl = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, { audioUrl: args.audioUrl });
  },
});
