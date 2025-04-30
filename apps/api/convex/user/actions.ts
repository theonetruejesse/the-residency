"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { ELEVEN_LABS_AGENT_ID, elevenClient, geminiClient } from "../constants";
import { MISSION_ARGS } from "../schema.types";
import { firstQuestionPrompt, rolePrompt, taglinePrompt } from "../prompts";
import { internal } from "../_generated/api";

export const generateSessionUrl = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    try {
      const response = await elevenClient.conversationalAi.getSignedUrl({
        agent_id: ELEVEN_LABS_AGENT_ID as string,
      });

      await ctx.runMutation(internal.user.session.updateSession, {
        sessionId: args.sessionId,
        sessionUrl: response.signed_url,
      });
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  },
});

export const generateContent = internalAction({
  args: {
    ...MISSION_ARGS,
  },
  returns: v.object({
    firstQuestion: v.string(),
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

    const [firstQuestion, role, tagline] = await Promise.all([
      generate(firstQuestionPrompt(interest, accomplishment)),
      generate(rolePrompt(interest, accomplishment)),
      generate(taglinePrompt(interest, accomplishment)),
    ]);

    if (!firstQuestion || !role || !tagline) {
      throw new Error("Failed to generate content");
    }

    return { firstQuestion, role, tagline };
  },
});
