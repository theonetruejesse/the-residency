import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";

// SETTINGS
export const MAX_ACTIVE_SESSIONS = 5;
// 5 minutes to start, 15 minutes for the call itself; user gets kicked out after this time
export const MAX_SESSION_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

// ENV VARIABLES (+validation)
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
export const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID; // clean this up later
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!ELEVEN_LABS_AGENT_ID || !ELEVEN_LABS_API_KEY || !GEMINI_API_KEY) {
  throw new Error("Environment variables not configured");
}

// SDK CLIENTS
export const elevenClient = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

export const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
