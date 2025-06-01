import { createClerkClient } from "@clerk/backend";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
import { Resend } from "resend";

// SETTINGS
export const CURRENT_COHORT = "SUMMER_2025";
export const MAX_CONCURRENT_CALLS = 5;

// 5 minutes to start, 10 minutes for the call itself; applicant gets kicked out after this time
const MAX_WAIT = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CALL = 10 * 60 * 1000; // 10 minutes in milliseconds
export const MAX_SESSION_DURATION = MAX_CALL + MAX_WAIT;

// ENV VARIABLES (+ validation)
export const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID;
export const ELEVEN_LABS_WEBHOOK_SECRET =
  process.env.ELEVEN_LABS_WEBHOOK_SECRET;
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
export const CLERK_WEBHOOK_SIGNING_SECRET =
  process.env.CLERK_WEBHOOK_SIGNING_SECRET;

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const WEB_URL = process.env.WEB_URL;

export const EMAIL_ADDRESS = "noreply@test.collegiate-consulting.com"; // todo, change me; e.g, nick@uncommonapp.app

if (
  !ELEVEN_LABS_AGENT_ID ||
  !ELEVEN_LABS_API_KEY ||
  !GEMINI_API_KEY ||
  !ELEVEN_LABS_WEBHOOK_SECRET ||
  !CLERK_SECRET_KEY ||
  !CLERK_WEBHOOK_SIGNING_SECRET ||
  !RESEND_API_KEY ||
  !WEB_URL
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

export const resendClient = new Resend(RESEND_API_KEY);
