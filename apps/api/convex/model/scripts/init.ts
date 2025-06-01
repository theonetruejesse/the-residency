// seed the database
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

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
      // anyUser ||
      // anyBasicInfo ||
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

    const numApplicants = 30;
    const cohort = "SUMMER_2025" as const;
    const ranking = "neutral" as const;

    const rounds = [
      ...Array(5).fill("intake" as const),
      ...Array(11).fill("first_round" as const),
      ...Array(14).fill("second_round" as const),
    ];

    const statuses = [
      ...Array(20).fill("pending" as const),
      ...Array(3).fill("waitlisted" as const),
      ...Array(3).fill("accepted" as const),
      ...Array(4).fill("rejected" as const),
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
        score: Math.floor(Math.random() * 100).toString(),
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

    // User, Session, and Persona seeding logic starts here
    console.log(
      "Starting to seed users, sessions, and personas for first_round applicants..."
    );

    // Sample roles and taglines for personas based on missions
    const samplePersonas = [
      {
        role: "Tech Innovation Pioneer",
        tagline: "Pushing boundaries in emerging technologies",
      },
      {
        role: "Digital Solutions Architect",
        tagline: "Building scalable systems for complex challenges",
      },
      {
        role: "Research Enthusiast",
        tagline: "Bridging theory and practical applications",
      },
      {
        role: "Product Visionary",
        tagline: "Creating user-centric solutions that matter",
      },
      {
        role: "Data Science Expert",
        tagline: "Extracting insights from complex datasets",
      },
      {
        role: "AI/ML Specialist",
        tagline: "Advancing artificial intelligence applications",
      },
      {
        role: "Full-Stack Developer",
        tagline: "End-to-end solution development",
      },
      { role: "Systems Engineer", tagline: "Optimizing performance at scale" },
      {
        role: "UX Design Leader",
        tagline: "Crafting exceptional user experiences",
      },
      {
        role: "Startup Founder",
        tagline: "Turning innovative ideas into reality",
      },
      {
        role: "Open Source Contributor",
        tagline: "Building the future of collaborative development",
      },
    ];

    const sessionIds: Id<"sessions">[] = [];
    const userIds: Id<"users">[] = [];

    // Create users and sessions for all first_round applicants
    for (const applicant of applicantIds) {
      // Get the applicant record to access basicInfoId and missionId
      const applicantRecord = await ctx.db.get(applicant.id);
      if (!applicantRecord) throw new Error("Applicant not found");

      // Create user with role "applicant"
      const userId = await ctx.db.insert("users", {
        role: "applicant",
        basicInfoId: applicantRecord.basicInfoId,
        missionId: applicantRecord.missionId,
        backgroundId: applicantRecord.backgroundId,
        linkId: applicantRecord.linkId,
      });
      userIds.push(userId);

      // Create session
      const sessionId = await ctx.db.insert("sessions", {
        waiting: false,
        inCall: false,
        applicantId: applicant.id,
        missionId: applicantRecord.missionId,
      });
      sessionIds.push(sessionId);
    }

    // Configure session states: 5 inCall (spaced a minute apart), 6 waiting
    const baseTime = Date.now();

    // Configure first 5 sessions as inCall with scheduled end times
    for (let i = 0; i < 5; i++) {
      const sessionId = sessionIds[i];
      if (!sessionId) continue;

      const firstDelay = 5 * 60 * 1000;
      const scheduledEndTime = baseTime + firstDelay + (i + 1) * 60 * 1000; // Spaced 1 minute apart
      const sessionUrl = `https://example.com/session/active-${i}`;

      // Schedule the end of the call
      const endCallFnId = await ctx.scheduler.runAt(
        new Date(scheduledEndTime),
        internal.application.queue.scheduledLeave,
        { sessionId }
      );

      // Update session to be in call
      await ctx.db.patch(sessionId, {
        waiting: false,
        inCall: true,
        sessionUrl,
        scheduledEndTime,
        endCallFnId,
        queuedAt: baseTime - 5 * 60 * 1000, // Started queue 5 minutes ago
      });
    }

    // Configure remaining 6 sessions as waiting
    for (let i = 5; i < sessionIds.length; i++) {
      const sessionId = sessionIds[i];
      if (!sessionId) continue;

      const queuedAt = baseTime + (i - 5) * 2000; // Stagger queue join times by 2 seconds

      await ctx.db.patch(sessionId, {
        waiting: true,
        inCall: false,
        queuedAt,
      });
    }

    // Create personas for all sessions
    for (let i = 0; i < sessionIds.length; i++) {
      const sessionId = sessionIds[i];
      const personaData =
        samplePersonas[i] || samplePersonas[i % samplePersonas.length];

      if (!sessionId || !personaData) continue;

      await ctx.db.insert("personas", {
        sessionId,
        role: personaData.role,
        tagline: personaData.tagline,
      });
    }

    console.log(
      `Successfully seeded ${sessionIds.length} users, sessions, and personas for first_round applicants.`
    );
    console.log(
      `Configured 5 sessions as inCall and ${sessionIds.length - 5} as waiting.`
    );
    // User, Session, and Persona seeding logic ends here

    return null;
  },
});
