"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import {
  clerkClient,
  ELEVEN_LABS_AGENT_ID,
  elevenClient,
  geminiClient,
  WEB_URL,
} from "../constants";
import { rolePrompt, taglinePrompt } from "../utils/prompts";
import { Missions } from "../model/applicants";
import { internal } from "../_generated/api";
import {
  agentCriterias,
  agentDynamicVariables,
  agentFirstMessage,
  agentSystemPrompt,
} from "../utils/agent";

export const generateContent = internalAction({
  args: {
    ...Missions.withoutSystemFields,
  },
  returns: v.object({
    role: v.string(),
    tagline: v.string(),
  }),
  handler: async (_ctx, args) => {
    const { interest, accomplishment } = args;

    const generate = async (prompt: string) => {
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      return response.text;
    };

    const [role, tagline] = await Promise.all([
      generate(rolePrompt(interest, accomplishment)),
      generate(taglinePrompt(interest, accomplishment)),
    ]);

    if (!role || !tagline) {
      throw new Error("Failed to generate content");
    }

    return { role, tagline };
  },
});

export const inviteApplicantUser = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const basicInfo = await ctx.runQuery(
      internal.application.user.getUserBasicInfo,
      { userId }
    );
    if (!basicInfo) throw new Error("Basic info not found");

    const response = await clerkClient.invitations.createInvitation({
      emailAddress: basicInfo.email,
      redirectUrl: `${WEB_URL}/signup?r=interview`,
      ignoreExisting: true,
      publicMetadata: {
        role: "applicant",
        convexUserId: args.userId,
      },
    });
  },
});

export const inviteAdmin = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await clerkClient.invitations.createInvitation({
      emailAddress: args.email,
      redirectUrl: `${WEB_URL}/signup?r=admin`,
      ignoreExisting: true,
      publicMetadata: {
        role: "admin",
        convexUserId: args.userId,
      },
    });
  },
});

export const generateSessionUrl = internalAction({
  args: {},
  returns: v.string(),
  handler: async (_ctx, _args) => {
    try {
      await syncAgentConfig();
      const response = await elevenClient.conversationalAi.getSignedUrl({
        agent_id: ELEVEN_LABS_AGENT_ID as string,
      });
      return response.signed_url;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  },
});

const syncAgentConfig = async () => {
  const updatedAgent = await elevenClient.conversationalAi.updateAgent(
    ELEVEN_LABS_AGENT_ID as string,
    {
      platform_settings: {
        data_collection: agentCriterias,
      },
      conversation_config: {
        agent: {
          dynamic_variables: agentDynamicVariables,
          prompt: agentSystemPrompt,
          first_message: agentFirstMessage,
        },
      },
    }
  );

  return updatedAgent;
};
