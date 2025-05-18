import { customAlphabet } from "nanoid";

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 10);
export const generateId = () => nanoid(); //=> "vcq0msqzdi"
