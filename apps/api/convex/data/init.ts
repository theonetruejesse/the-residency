// seed the database

import { Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

const tenMinutesInMs = 10 * 60 * 1000;
const oneHourInMs = 60 * 60 * 1000;

const seedUsers = [
  { firstName: "Arya", lastName: "Kumar", round: "intake", status: "pending" },
  { firstName: "John", lastName: "Doe", round: "intake", status: "pending" },
  { firstName: "Evelyn", lastName: "Li", round: "intake", status: "pending" },
  { firstName: "Maya", lastName: "Patel", round: "intake", status: "pending" },
  { firstName: "Zack", lastName: "Wilson", round: "intake", status: "pending" },
  { firstName: "Sara", lastName: "Chen", round: "intake", status: "pending" },
  {
    firstName: "David",
    lastName: "Garcia",
    round: "intake",
    status: "pending",
  },
  { firstName: "Emma", lastName: "Taylor", round: "intake", status: "pending" },
  { firstName: "Lucas", lastName: "Brown", round: "intake", status: "pending" },
  {
    firstName: "Olivia",
    lastName: "Miller",
    round: "intake",
    status: "pending",
  },
  {
    firstName: "Noah",
    lastName: "Johnson",
    round: "intake",
    status: "pending",
  },
  {
    firstName: "Sophia",
    lastName: "Davis",
    round: "intake",
    status: "pending",
  },
  {
    firstName: "Liam",
    lastName: "Rodriguez",
    round: "intake",
    status: "pending",
  },
  {
    firstName: "Isabella",
    lastName: "Martinez",
    round: "intake",
    status: "pending",
  },
  {
    firstName: "Ethan",
    lastName: "Anderson",
    round: "intake",
    status: "pending",
  },
] as const;

// Seed data for missions
const seedMissions = [
  {
    interest: "Quantum computing applications in cryptography",
    accomplishment: "Built a secure messaging app with over 100,000 users",
  },
  {
    interest: "Sustainable agriculture technologies",
    accomplishment:
      "Developed an IoT system for optimizing water usage in farms",
  },
  {
    interest: "AI-powered language learning platforms",
    accomplishment:
      "Published research on pattern recognition in language acquisition",
  },
  {
    interest: "Blockchain solutions for supply chain management",
    accomplishment:
      "Led a team that reduced tracking errors by 75% using distributed ledger",
  },
  {
    interest: "Renewable energy storage systems",
    accomplishment:
      "Patented a new battery technology with 30% higher capacity",
  },
  {
    interest: "Neural interfaces for accessibility",
    accomplishment:
      "Created an open-source framework for adaptive technologies",
  },
  {
    interest: "Climate modeling and prediction algorithms",
    accomplishment: "Contributed to a major climate research project at MIT",
  },
  {
    interest: "Biomedical imaging using machine learning",
    accomplishment:
      "Developed an algorithm that improved tumor detection accuracy by 40%",
  },
  {
    interest: "Autonomous vehicle navigation systems",
    accomplishment: "Won first place in an international robotics competition",
  },
  {
    interest: "Personalized medicine through genomics",
    accomplishment:
      "Co-authored three papers on targeted drug delivery methods",
  },
  {
    interest: "Urban planning optimization using data science",
    accomplishment:
      "Designed a traffic management system deployed in three major cities",
  },
  {
    interest: "Quantum machine learning algorithms",
    accomplishment:
      "Received a research grant from the National Science Foundation",
  },
  {
    interest: "AR/VR applications in education",
    accomplishment: "Created a virtual lab platform used by 50+ universities",
  },
  {
    interest: "Cybersecurity in IoT networks",
    accomplishment:
      "Discovered and responsibly disclosed vulnerabilities in popular smart home devices",
  },
  {
    interest: "Computational linguistics and NLP",
    accomplishment:
      "Built a sentiment analysis tool with 95% accuracy across 7 languages",
  },
];

// Generated personas based on missions
const generatePersonas = (sessionIds: Id<"sessions">[]) => [
  {
    sessionId: sessionIds[0],
    role: "Quantum Security Pioneer",
    tagline:
      "Innovative cryptography engineer leveraging quantum principles to redefine digital communication security.",
  },
  {
    sessionId: sessionIds[1],
    role: "AgTech Innovator",
    tagline:
      "IoT systems architect transforming agricultural efficiency through data-driven water conservation technologies.",
  },
  {
    sessionId: sessionIds[2],
    role: "Linguistics AI Researcher",
    tagline:
      "Published language acquisition expert applying pattern recognition to revolutionize language learning platforms.",
  },
  {
    sessionId: sessionIds[3],
    role: "Blockchain Logistics Architect",
    tagline:
      "Supply chain optimization leader harnessing distributed ledger technology to eliminate tracking inefficiencies.",
  },
  {
    sessionId: sessionIds[4],
    role: "Energy Storage Inventor",
    tagline:
      "Patent-holding battery technologist pushing the boundaries of renewable energy storage capacity.",
  },
  {
    sessionId: sessionIds[5],
    role: "Accessibility Interface Designer",
    tagline:
      "Open-source framework developer creating neural interfaces that break barriers in assistive technology.",
  },
  {
    sessionId: sessionIds[6],
    role: "Climate Algorithm Specialist",
    tagline:
      "MIT research contributor advancing predictive modeling to address global climate challenges.",
  },
  {
    sessionId: sessionIds[7],
    role: "Medical Imaging Innovator",
    tagline:
      "Algorithm developer enhancing diagnostic accuracy through cutting-edge machine learning applications.",
  },
  {
    sessionId: sessionIds[8],
    role: "Autonomous Navigation Expert",
    tagline:
      "Award-winning robotics engineer solving complex challenges in vehicle navigation systems.",
  },
  {
    sessionId: sessionIds[9],
    role: "Genomic Medicine Researcher",
    tagline:
      "Published author in targeted drug delivery working to personalize medicine through genomic insights.",
  },
  {
    sessionId: sessionIds[10],
    role: "Urban Data Scientist",
    tagline:
      "Traffic system architect applying data science to optimize urban infrastructure in metropolitan areas.",
  },
  {
    sessionId: sessionIds[11],
    role: "Quantum ML Researcher",
    tagline:
      "Grant-funded scientist exploring the intersection of quantum computing and machine learning algorithms.",
  },
  {
    sessionId: sessionIds[12],
    role: "Educational XR Developer",
    tagline:
      "Virtual lab creator transforming educational experiences through immersive AR/VR technologies.",
  },
  {
    sessionId: sessionIds[13],
    role: "IoT Security Expert",
    tagline:
      "Vulnerability researcher strengthening cybersecurity frameworks for interconnected device networks.",
  },
  {
    sessionId: sessionIds[14],
    role: "Computational Linguist",
    tagline:
      "Multilingual NLP engineer developing high-accuracy sentiment analysis tools across diverse languages.",
  },
];

// Generate first questions based on missions
const generateFirstQuestions = (missions: typeof seedMissions) => [
  "Your secure messaging app reaching 100,000 users is impressive. What specific aspects of quantum computing do you see revolutionizing cryptography in the next few years?",
  "Developing an IoT system for farm water optimization shows great practical impact. What challenges in sustainable agriculture technology are you most excited to tackle next?",
  "Your research on pattern recognition in language acquisition is fascinating. How do you envision AI transforming the way we approach language learning platforms?",
  "Leading a team that achieved a 75% reduction in tracking errors is remarkable. What potential do you see for blockchain beyond supply chain that excites you?",
  "Patenting battery technology with 30% higher capacity is significant. What do you see as the biggest hurdle in renewable energy storage that you're keen to address?",
  "Creating an open-source framework for adaptive technologies demonstrates your commitment to accessibility. How do you envision neural interfaces evolving to further improve accessibility?",
  "Your contribution to MIT's climate research is notable. What aspects of climate modeling algorithms do you find most challenging or intriguing?",
  "Developing an algorithm that improved tumor detection by 40% is impactful work. What directions in biomedical imaging and machine learning are you most passionate about exploring?",
  "Winning an international robotics competition is quite an achievement. What unsolved problems in autonomous navigation systems are you most interested in tackling?",
  "Co-authoring papers on targeted drug delivery shows your expertise. How do you see genomics transforming personalized medicine in the coming decade?",
  "Designing a traffic management system used in multiple cities is impressive. What data science approaches do you find most promising for urban planning challenges?",
  "Receiving an NSF research grant speaks to the quality of your work. What excites you most about the intersection of quantum computing and machine learning?",
  "Creating a virtual lab platform adopted by 50+ universities is a significant achievement. What untapped potential do you see for AR/VR in educational contexts?",
  "Your responsible disclosure of smart home vulnerabilities demonstrates valuable expertise. What cybersecurity challenges in IoT networks do you find most compelling?",
  "Building a sentiment analysis tool with 95% accuracy across multiple languages is remarkable. What aspects of computational linguistics are you most eager to explore further?",
];

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    // If this project already has a populated database, do nothing
    const anyUser = await ctx.db.query("users").first();
    const anySession = await ctx.db.query("sessions").first();
    const anyPersona = await ctx.db.query("personas").first();
    const anyMission = await ctx.db.query("missions").first();
    if (anyUser || anySession || anyPersona || anyMission) return null;

    const userIds: Id<"users">[] = [];
    const missionIds: Id<"missions">[] = [];
    const sessionIds: Id<"sessions">[] = [];

    // Create users and store their IDs
    for (const user of seedUsers) {
      const userId = await ctx.db.insert("users", user);
      userIds.push(userId);
    }

    // Create missions and store their IDs
    for (let i = 0; i < seedUsers.length; i++) {
      const missionId = await ctx.db.insert("missions", {
        userId: userIds[i],
        interest: seedMissions[i].interest,
        accomplishment: seedMissions[i].accomplishment,
      });
      missionIds.push(missionId);
    }

    // Create sessions with varying configurations:
    // 1. 2 inactive sessions without sessionUrl (index 0-1)
    for (let i = 0; i < 2; i++) {
      const sessionId = await ctx.db.insert("sessions", {
        userId: userIds[i],
        missionId: missionIds[i],
        active: false,
        inCall: false,
        firstQuestion: generateFirstQuestions(seedMissions)[i],
        updatedAt: Date.now(),
      });
      sessionIds.push(sessionId);
    }

    // 2. 2 inactive sessions with sessionUrl (index 2-3)
    let j = 0;
    for (let i = 2; i < 4; i++) {
      const sessionId = await ctx.db.insert("sessions", {
        userId: userIds[i],
        missionId: missionIds[i],
        active: false,
        inCall: false,
        sessionUrl: "https://example.com/session/placeholder-" + j,
        firstQuestion: generateFirstQuestions(seedMissions)[i],
        updatedAt: Date.now(),
      });
      sessionIds.push(sessionId);
      j++;
    }

    // 3. 5 active sessions with sessionUrl and endCallFnId (index 4-8)
    for (let i = 4; i < 9; i++) {
      const sessionId = await ctx.db.insert("sessions", {
        userId: userIds[i],
        missionId: missionIds[i],
        active: true,
        inCall: true,
        sessionUrl: "https://example.com/session/placeholder-" + j,
        firstQuestion: generateFirstQuestions(seedMissions)[i],
        updatedAt: Date.now(),
      });
      sessionIds.push(sessionId);
      j++;

      // delays for queues
      let time = oneHourInMs;
      if (i === 4) time = tenMinutesInMs;

      const endCallFnId = await ctx.scheduler.runAfter(
        time,
        internal.user.queue.leaveQueue,
        { sessionId }
      );

      // Update the session with the scheduled function ID
      await ctx.db.patch(sessionId, { endCallFnId });
    }

    // 4. 6 active sessions without sessionUrl (index 9-14)
    for (let i = 9; i < 15; i++) {
      const sessionId = await ctx.db.insert("sessions", {
        userId: userIds[i],
        missionId: missionIds[i],
        active: true,
        inCall: false,
        firstQuestion: generateFirstQuestions(seedMissions)[i],
        updatedAt: Date.now(),
      });
      sessionIds.push(sessionId);
    }

    // Create personas
    const personas = generatePersonas(sessionIds);
    for (let i = 0; i < sessionIds.length; i++) {
      await ctx.db.insert("personas", {
        sessionId: sessionIds[i],
        role: personas[i].role,
        tagline: personas[i].tagline,
      });
    }

    return null;
  },
});
