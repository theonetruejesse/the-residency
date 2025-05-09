import { createClerkClient } from "@clerk/backend";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";

// SETTINGS
export const MAX_CONCURRENT_CALLS = 5;
// 5 minutes to start, 15 minutes for the call itself; user gets kicked out after this time
export const MAX_SESSION_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

// ENV VARIABLES (+validation); honestly not needed since convex checks for them
// todo, just remove this
export const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID; // clean this up later
export const ELEVEN_LABS_WEBHOOK_SECRET =
  process.env.ELEVEN_LABS_WEBHOOK_SECRET;

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (
  !ELEVEN_LABS_AGENT_ID ||
  !ELEVEN_LABS_API_KEY ||
  !GEMINI_API_KEY ||
  !ELEVEN_LABS_WEBHOOK_SECRET ||
  !CLERK_SECRET_KEY
) {
  throw new Error("Environment variables not configured");
}

// SDK CLIENTS
export const elevenClient = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

export const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
});
