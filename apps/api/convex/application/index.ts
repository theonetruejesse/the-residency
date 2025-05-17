import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id, Doc } from "../_generated/dataModel";
import {
  Applicants,
  Backgrounds,
  BasicInfo,
  Links,
  Missions,
} from "../model/applicants";
import { INTERVIEW_STATUS_OPTIONS, Sessions } from "../model/sessions";

export const submitIntake = mutation({
  args: {
    basicInfo: v.object({
      ...BasicInfo.withoutSystemFields,
    }),
    mission: v.object({
      ...Missions.withoutSystemFields,
    }),
    background: v.object({
      ...Backgrounds.withoutSystemFields,
    }),
    link: v.object({
      ...Links.withoutSystemFields,
    }),
  },
  returns: v.id("applicants"),
  handler: async (ctx, args): Promise<Id<"applicants">> => {
    const basicInfoId = await ctx.db.insert("basicInfo", args.basicInfo);
    const missionId = await ctx.db.insert("missions", args.mission);
    const backgroundId = await ctx.db.insert("backgrounds", args.background);
    const linkId = await ctx.db.insert("links", args.link);

    const applicantId = await ctx.runMutation(
      internal.application.applicant.createApplicant,
      {
        basicInfoId,
        missionId,
        backgroundId,
        linkId,
      }
    );
    return applicantId;
  },
});

// we either join the queue or join the call; this function handles both
export const handleJoin = action({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    const { applicantId } = args;

    const userSession = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId }
    );
    if (!userSession) throw new Error("User session not found");

    await ctx.runAction(internal.application.queue.handleJoin, {
      sessionId: userSession._id,
    });
  },
});

// remove user from the active call list or queue
export const handleLeave = action({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    const { applicantId } = args;

    const session = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId }
    );
    if (!session) throw new Error("Session not found");

    await ctx.runAction(internal.application.queue.handleLeave, {
      sessionId: session._id,
    });
  },
});

// QUERIES
export const getProfile = query({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: v.union(
    v.object({
      applicant: Applicants.table.validator,
      mission: Missions.table.validator,
      session: Sessions.table.validator,
    }),
    v.null()
  ),
  handler: async (
    ctx,
    args
  ): Promise<{
    applicant: Doc<"applicants">;
    mission: Doc<"missions">;
    session: Doc<"sessions">;
  } | null> => {
    const { applicantId } = args;

    const applicant = await ctx.db.get(applicantId);
    if (!applicant) throw new Error("Applicant not found");

    const mission = await ctx.db.get(applicant.missionId);
    if (!mission) throw new Error("Mission not found");

    const session = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId }
    );
    if (!session) throw new Error("Session not found");

    return { applicant, mission, session };
  },
});

export const getInterviewStatus = query({
  args: {
    applicantId: v.id("applicants"),
  },
  returns: INTERVIEW_STATUS_OPTIONS,
  handler: async (
    ctx,
    args
  ): Promise<
    "active_call" | "in_queue" | "post_interview" | "join_queue" | "join_call"
  > => {
    const applicantSession = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId: args.applicantId }
    );
    if (!applicantSession) throw new Error("Applicant session not found");

    const { waiting, inCall, sessionUrl } = applicantSession;

    if (inCall) return "active_call";
    if (waiting) return "in_queue";
    if (!waiting && sessionUrl) return "post_interview";

    const isQueueFull: boolean = await ctx.runQuery(
      internal.application.queue.isQueueFull
    );
    return isQueueFull ? "join_queue" : "join_call";
  },
});

// returns all waiting list members: sessions, personas
export const getWaitingList = query({
  args: {},
  returns: v.array(
    v.object({
      sessionId: v.id("sessions"),
      role: v.string(),
      tagline: v.string(),
    })
  ),
  handler: async (
    ctx
  ): Promise<
    {
      sessionId: Id<"sessions">;
      role: string;
      tagline: string;
    }[]
  > => {
    const sessions = await ctx.runQuery(
      internal.application.queue.listWaitingSessions
    );

    return await Promise.all(
      sessions.map(async (session) => {
        const persona = await ctx.runQuery(
          internal.application.session.getSessionPersona,
          { sessionId: session._id }
        );
        if (!persona) throw new Error(`No persona found for ${session._id}`);

        return {
          sessionId: session._id,
          role: persona.role,
          tagline: persona.tagline,
        };
      })
    );
  },
});

// returns the max wait time for a session in the queue (in minutes)
export const getMaxWaitTime = query({
  args: { sessionId: v.id("sessions") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const waitTime: number = await ctx.runQuery(
      internal.application.wait.getSessionWaitTime,
      { sessionId: args.sessionId }
    );
    return waitTime;
  },
});

// TODO; fix this later
// check if userIdString is valid and return userId
export const userIdFromStr = query({
  args: { userIdString: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const documentId = ctx.db.normalizeId("users", args.userIdString);
    return documentId;
  },
});
