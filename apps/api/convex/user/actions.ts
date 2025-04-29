"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { MISSION } from "../schema";
import { ELEVEN_LABS_AGENT_ID, elevenClient, geminiClient } from "../constants";

export const generateSessionUrl = internalAction({
  returns: v.object({
    sessionUrl: v.union(v.string(), v.null()),
  }),
  handler: async (_ctx, _args) => {
    try {
      const response = await elevenClient.conversationalAi.getSignedUrl({
        agent_id: ELEVEN_LABS_AGENT_ID as string,
      });
      return { sessionUrl: response.signed_url };
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  },
});

export const generateFirstQuestion = internalAction({
  args: {
    ...MISSION,
  },
  returns: v.object({
    firstQuestion: v.string(),
  }),
  handler: async (_ctx, args) => {
    const prompt = `
    You are a first round interviewer trying to learn more about the user's background.
    You are given the user's mission in life.
    Generate a short and concise question to start the interview based on the user's mission.
    User's Mission:
    - Interests: ${args.interest}
    - Accomplishments: ${args.accomplishment}
    `;

    const response = await geminiClient.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const firstQuestion = response.text;

    if (!firstQuestion) {
      throw new Error("Failed to generate first question");
    }

    return { firstQuestion };
  },
});
