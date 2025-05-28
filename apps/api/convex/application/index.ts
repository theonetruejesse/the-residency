import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id, Doc } from "../_generated/dataModel";
import { Backgrounds, BasicInfo, Links, Missions } from "../model/applicants";
import {
  userApplicantAction,
  userApplicantQuery,
  userQuery,
} from "../utils/wrappers";
import {
  ApplicantProfile,
  SessionStatus,
  WaitListMember,
} from "../types/application.types";

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
export const handleJoin = userApplicantAction({
  args: {},
  handler: async (ctx) => {
    const { applicant } = ctx;

    const session = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId: applicant._id }
    );
    if (!session) throw new Error("Session not found");

    await ctx.runAction(internal.application.queue.handleJoin, {
      sessionId: session._id,
    });
  },
});

// remove user from the active call list or queue
export const handleLeave = userApplicantAction({
  args: {},
  handler: async (ctx) => {
    const { applicant } = ctx;

    const session = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId: applicant._id }
    );
    if (!session) throw new Error("Session not found");

    await ctx.runAction(internal.application.queue.handleLeave, {
      sessionId: session._id,
    });
  },
});

// QUERIES
export const getProfile = userApplicantQuery({
  args: {},
  handler: async (ctx): Promise<ApplicantProfile> => {
    const { applicant } = ctx;

    const mission = await ctx.db.get(applicant.missionId);
    if (!mission) throw new Error("Mission not found");

    return { applicant, mission };
  },
});

export const getSessionStatus = userApplicantQuery({
  args: {},
  handler: async (ctx): Promise<SessionStatus> => {
    const { applicant } = ctx;

    const applicantSession = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId: applicant._id }
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
export const getWaitingList = userQuery({
  args: {},
  handler: async (ctx): Promise<WaitListMember[]> => {
    const sessions = await ctx.runQuery(
      internal.application.queue.listWaitingSessions
    );

    return await Promise.all(
      sessions.map(async (session: Doc<"sessions">) => {
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
export const getMaxWaitTime = userApplicantQuery({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const { applicant } = ctx;

    const session = await ctx.runQuery(
      internal.application.applicant.getApplicantSession,
      { applicantId: applicant._id }
    );
    if (!session) throw new Error("Session not found");

    const waitTime: number = await ctx.runQuery(
      internal.application.wait.getSessionWaitTime,
      { sessionId: session._id }
    );
    return waitTime;
  },
});
