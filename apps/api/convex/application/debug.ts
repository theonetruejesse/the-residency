import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation } from "../_generated/server";
import { ELEVEN_LABS_AGENT_ID } from "../constants";
import { elevenClient } from "../constants";
import { AGENT_CONFIG } from "../utils/agent_config";

export const kickSession = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.application.queue.handleLeave, {
      sessionId: args.sessionId,
    });
  },
});

export const getAgent = internalAction({
  args: {},
  handler: async (_ctx, _args) => {
    try {
      const response = await elevenClient.conversationalAi.getAgent(
        ELEVEN_LABS_AGENT_ID as string
      );
      return response;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  },
});

export const updateAgent = internalAction({
  args: {},
  handler: async (_ctx, _args) => {
    const updatedAgent = await elevenClient.conversationalAi.updateAgent(
      ELEVEN_LABS_AGENT_ID as string,
      AGENT_CONFIG
    );

    return updatedAgent;
  },
});
