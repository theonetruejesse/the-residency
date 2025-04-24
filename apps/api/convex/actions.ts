"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server.js";

const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID;
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

export const generateSessionUrl = internalAction({
  returns: v.object({
    sessionUrl: v.union(v.string(), v.null()),
  }),
  handler: async (_ctx, _args) => {
    console.log("ELEVEN_LABS_AGENT_ID", ELEVEN_LABS_AGENT_ID);
    console.log("ELEVEN_LABS_API_KEY", ELEVEN_LABS_API_KEY);

    if (!ELEVEN_LABS_AGENT_ID || !ELEVEN_LABS_API_KEY) {
      throw new Error("Eleven Labs credentials not configured");
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVEN_LABS_AGENT_ID}`,
        {
          headers: {
            "xi-api-key": ELEVEN_LABS_API_KEY,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }
      const data = await response.json();
      return { sessionUrl: data.signed_url as string };
    } catch (error) {
      console.error(error);
      return { sessionUrl: null }; // null is means there was an error
    }
  },
});
