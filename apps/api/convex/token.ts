"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { api } from "./_generated/api";

const AGORA_APP_ID = process.env.AGORA_APP_ID ?? "";
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE ?? "";

console.log(AGORA_APP_ID, AGORA_APP_CERTIFICATE);

export const generateToken = internalAction({
  args: { userId: v.number() },
  handler: async (ctx, args) => {
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      throw new Error("Agora credentials not configured");
    }

    const user = await ctx.runQuery(api.users.getUser, {
      userId: args.userId,
    });

    if (!user) throw new Error("User not found");

    // Set token expiry (5 hours from now)
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 3600 * 5;

    // Generate RTC token
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      user.userId.toString(), // roomId
      user.userId, // uid
      RtcRole.PUBLISHER,
      expirationTimeInSeconds,
      expirationTimeInSeconds // privilegeExpire
    );

    return {
      rtcToken,
      expiresAt: expirationTimeInSeconds,
    };
  },
});
