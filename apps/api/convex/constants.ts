import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";

export const MAX_ACTIVE_SESSIONS = 5;

export const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID; // clean this up later
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!ELEVEN_LABS_AGENT_ID || !ELEVEN_LABS_API_KEY || !GEMINI_API_KEY) {
  throw new Error("Keys not configured");
}

export const elevenClient = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

export const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
