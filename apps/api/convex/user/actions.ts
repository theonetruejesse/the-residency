"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { ELEVEN_LABS_AGENT_ID, elevenClient, geminiClient } from "../constants";
import { MISSION_ARGS } from "../schema.types";

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
    ...MISSION_ARGS,
  },
  returns: v.object({
    firstQuestion: v.string(),
  }),
  handler: async (_ctx, args) => {
    const prompt = `
<directions>
Your goal is to initiate a "smart conversation" by thoughtfully acknowledging the applicant's background and smoothly transitioning to their current interests.
You are provided with the applicant's key interests and significant accomplishments.
Craft a short opening that begins with a brief, professional acknowledgment of a notable accomplishment, phrased in a way that conveys genuine, understated respect for its significance. This acknowledgment should subtly connect or transition to a concise, open-ended question designed to explore the applicant's interests and initiate dialogue about their passions, making the entire opening feel like a natural, intellectually linked thought, suitable for an interview context. Maintain a friendly, insightful, and genuinely curious tone that is appropriate for a professional interview setting. 
</directions>

<guardrails>
Do not repeat anything by scratch.
The opening must be a single, short response combining an accomplishment acknowledgment and a question.
The acknowledgment should be brief, specific to an accomplishment, convey genuine, *understated* respect for its significance (higher EQ), and be professionally phrased. Avoid hyperbole or overly dramatic language.
The question should be concise, directly related to their stated interests, and invite an expansive response.
Crucially, the acknowledgment and the question must be intellectually or thematically connected. The acknowledgment should naturally lead into or set the context for the question about their interests.
Avoid generic phrases; tailor the language to sound insightful, personally engaged, appreciative in a professional manner, and highlight the connection between their past achievements and current interests, while balancing intellectual depth and professionalism.
</guardrails>

<example>
user:
- Interests: Building Voice AI applications for healthcare
- Accomplishments: Published paper on cognitive science in Nature Journal

response:
It's great to see your publication in Nature, that's quite an achievement. Given your focus on complex cognitive science, what aspects of building Voice AI applications for healthcare are currently capturing your intellectual curiosity?

<user>
- Interests: ${args.interest}
- Accomplishments: ${args.accomplishment}
</user>
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
