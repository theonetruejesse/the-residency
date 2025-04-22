"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { RtcRole, RtcTokenBuilder } from "agora-token";

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

import { customAlphabet } from "nanoid";

// 4M IDs needed, in order to have a 1% probability of at least one collision.
// this id setup is the simplest way to be compatible with the agora uid setup

const alphabet = "0123456789";
const nanoid = customAlphabet(alphabet, 15);
const generateSessionId = () => {
  const id = nanoid();
  return parseInt(id);
};

export const generateToken = internalAction({
  returns: v.object({
    sessionId: v.number(),
    rtcToken: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (_ctx, _args) => {
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      throw new Error("Agora credentials not configured");
    }
    const sessionId = generateSessionId();

    // Set token expiry (5 hours from now); in seconds
    const expiresAt = Math.floor(Date.now() / 1000) + 3600 * 5;

    // Generate RTC token
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      sessionId.toString(), // channelName
      sessionId, // uid
      RtcRole.PUBLISHER,
      expiresAt,
      expiresAt // privilegeExpire
    );

    return {
      sessionId,
      rtcToken,
      expiresAt,
    };
  },
});
