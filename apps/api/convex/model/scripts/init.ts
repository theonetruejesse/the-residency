// seed the database
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "../../_generated/server";

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    // If this project already has a populated database, do nothing
    const anyApplicant = await ctx.db.query("applicants").first();
    const anyMission = await ctx.db.query("missions").first();
    const anyBackground = await ctx.db.query("backgrounds").first();
    const anyLink = await ctx.db.query("links").first();
    const anySession = await ctx.db.query("sessions").first();
    const anyPersona = await ctx.db.query("personas").first();
    const anyUser = await ctx.db.query("users").first();
    const anyBasicInfo = await ctx.db.query("basicInfo").first();
    if (
      anySession ||
      anyPersona ||
      anyMission ||
      anyApplicant ||
      anyBackground ||
      anyUser ||
      anyBasicInfo ||
      anyLink
    )
      return null;

    // Applicant seeding logic starts here
    console.log("Starting to seed applicant data...");

    const numApplicants = 40;
    const cohort = "SUMMER_2025" as const;
    const ranking = "neutral" as const;

    const rounds = [
      ...Array(30).fill("intake" as const),
      ...Array(5).fill("first_round" as const),
      ...Array(5).fill("second_round" as const),
    ];

    const statuses = [
      ...Array(35).fill("pending" as const),
      ...Array(2).fill("waitlisted" as const),
      ...Array(2).fill("accepted" as const),
      ...Array(1).fill("rejected" as const),
    ];

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

      await ctx.db.insert("applicants", {
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
    }

    console.log(
      `Successfully seeded ${numApplicants} applicants and their related data.`
    );
    // Applicant seeding logic ends here

    return null;
  },
});
