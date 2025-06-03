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
import { internal } from "../_generated/api";
import { AGENT_CONFIG } from "../utils/agent_config";
import { Id } from "../_generated/dataModel";

export const generateContent = internalAction({
  args: {
    interest: v.string(),
    accomplishment: v.string(),
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
    AGENT_CONFIG
  );

  return updatedAgent;
};

export const downloadAudio = internalAction({
  args: {
    applicantId: v.id("applicants"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(
      internal.application.applicant.getApplicantInterview,
      { applicantId: args.applicantId }
    );
    if (!data) throw new Error("Interview not found");

    const { conversationId, _id: interviewId } = data.interview;

    const readStream =
      await elevenClient.conversationalAi.getConversationAudio(conversationId);

    // Generate upload URL
    const url = await ctx.storage.generateUploadUrl();

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of readStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    // Upload to Convex storage
    const uploadResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: audioBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
      );
    }

    const { storageId } = await uploadResponse.json();
    const audioUrl = await ctx.storage.getUrl(storageId as Id<"_storage">);

    if (!audioUrl) throw new Error("Failed to upload audio");

    await ctx.runMutation(internal.application.interview.setInterviewUrl, {
      interviewId,
      audioUrl,
    });
  },
});
