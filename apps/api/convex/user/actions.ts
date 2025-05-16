"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { ELEVEN_LABS_AGENT_ID, elevenClient, geminiClient } from "../constants";
import { MISSION_ARGS } from "../model/schema.types";
import { rolePrompt, taglinePrompt } from "../prompts";

export const generateSessionUrl = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
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

export const generateContent = internalAction({
  args: {
    ...MISSION_ARGS,
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
