// seed the database
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "../../_generated/server";

const sampleAudioUrl =
  "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3";

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    // If this project already has a populated database, do nothing
    const anyUser = await ctx.db.query("users").first();
    const anyBasicInfo = await ctx.db.query("basicInfo").first();
    const anyApplicant = await ctx.db.query("applicants").first();
    const anyMission = await ctx.db.query("missions").first();
    const anyLink = await ctx.db.query("links").first();
    const anySession = await ctx.db.query("sessions").first();
    const anyPersona = await ctx.db.query("personas").first();
    const anyBackground = await ctx.db.query("backgrounds").first();
    const anyInterview = await ctx.db.query("interviews").first();
    const anyGrade = await ctx.db.query("grades").first();
    if (
      anyUser ||
      anyBasicInfo ||
      anySession ||
      anyPersona ||
      anyBackground ||
      anyMission ||
      anyApplicant ||
      anyLink ||
      anyInterview ||
      anyGrade
    )
      return null;

    // Applicant seeding logic starts here
    console.log("Starting to seed applicant data...");

    const numApplicants = 40;
    const cohort = "SUMMER_2025" as const;
    const ranking = "neutral" as const;

    const rounds = [
      ...Array(20).fill("intake" as const),
      ...Array(15).fill("first_round" as const),
      ...Array(5).fill("second_round" as const),
    ];

    const statuses = [
      ...Array(35).fill("pending" as const),
      ...Array(2).fill("waitlisted" as const),
      ...Array(2).fill("accepted" as const),
      ...Array(1).fill("rejected" as const),
    ];

    const applicantIds = [];

    for (let i = 0; i < numApplicants; i++) {
      const basicInfoId = await ctx.db.insert("basicInfo", {
        firstName: `FirstName${i}`,
        lastName: `LastName${i}`,
        email: `applicant${i}@example.com`,
        phoneNumber: `123-456-${String(7890 + i).padStart(4, "0")}`,
      });

      const missionId = await ctx.db.insert("missions", {
        interest: `Interest area ${i % 5}`,
        accomplishment: `Accomplishment details for applicant ${i}`,
      });

      const backgroundId = await ctx.db.insert("backgrounds", {
        gender: i % 2 === 0 ? "Female" : "Male",
        country: `Country ${i % 10}`,
        college: i % 3 === 0 ? `University ${i}` : undefined,
        referrals: i % 5 === 0 ? `ReferralName${i}` : undefined,
      });

      const linkId = await ctx.db.insert("links", {
        twitter: i % 4 === 0 ? `https://twitter.com/applicant${i}` : undefined,
        linkedin:
          i % 2 === 0 ? `https://linkedin.com/in/applicant${i}` : undefined,
        github: i % 3 === 0 ? `https://github.com/applicant${i}` : undefined,
        website: i % 5 === 0 ? `https://applicant${i}.com` : undefined,
      });

      const applicantId = await ctx.db.insert("applicants", {
        cohort: cohort,
        status: statuses[i],
        round: rounds[i],
        ranking: ranking,
        basicInfoId: basicInfoId,
        missionId: missionId,
        backgroundId: backgroundId,
        linkId: linkId,
        // userId will be undefined by default as it's optional
      });

      if (rounds[i] === "first_round") {
        applicantIds.push({ id: applicantId, index: i });
      }
    }

    console.log(
      `Successfully seeded ${numApplicants} applicants and their related data.`
    );
    // Applicant seeding logic ends here

    // Interview seeding logic starts here
    console.log("Starting to seed interview data...");

    // Get half of the first_round applicants for interviews
    const firstRoundInterviewCount = Math.ceil(applicantIds.length / 2);
    const applicantsForInterview = applicantIds.slice(
      0,
      firstRoundInterviewCount
    );

    // Define criteria and grade values directly
    const criteriaValues = [
      "mission",
      "intelligence",
      "vision",
      "traction",
      "determination",
    ] as const;
    const gradeValues = ["high", "medium", "low", "unclear"] as const;

    for (const applicant of applicantsForInterview) {
      const interviewId = await ctx.db.insert("interviews", {
        applicantId: applicant.id,
        conversationId: `conversation-${applicant.index}`,
        audioUrl: sampleAudioUrl,
        score: Math.floor(Math.random() * 100),
      });

      // Create grades for all criteria
      for (const criteria of criteriaValues) {
        const randomGradeIndex = Math.floor(Math.random() * gradeValues.length);
        await ctx.db.insert("grades", {
          interviewId: interviewId,
          criteria: criteria,
          grade: gradeValues[randomGradeIndex],
          quote: `Sample quote for ${criteria} from applicant ${applicant.index}`,
          rationale: `This applicant demonstrated ${gradeValues[randomGradeIndex]} ${criteria} because...`,
        });
      }
    }

    console.log(
      `Successfully seeded interviews and grades for ${firstRoundInterviewCount} first round applicants.`
    );
    // Interview seeding logic ends here

    return null;
  },
});
