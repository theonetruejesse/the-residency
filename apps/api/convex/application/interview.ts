import { v, Infer } from "convex/values";
import { internalMutation } from "../_generated/server";
import { CRITERIA_OPTIONS, GRADE_OPTIONS } from "../model/applicants";

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
