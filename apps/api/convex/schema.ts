import { defineSchema, defineTable } from "convex/server";
import {
  USER,
  BACKGROUND,
  LINK,
  MISSION,
  SESSION,
  PERSONA,
  GRADE,
} from "./schema.types";

export default defineSchema({
  // USER STUFF
  users: defineTable({
    ...USER,
  })
    .index("by_round", ["round"])
    .index("by_status", ["status"]),
  backgrounds: defineTable({
    ...BACKGROUND,
  }).index("by_user_id", ["userId"]),

  links: defineTable({
    ...LINK,
  }).index("by_user_id", ["userId"]),

  // INTERVIEW STUFF

  // focus for the first round interview
  missions: defineTable({
    ...MISSION,
  }).index("by_user_id", ["userId"]),

  // anomynous user info for the interview queue
  personas: defineTable({
    ...PERSONA,
  }).index("by_session_id", ["sessionId"]),

  // first round interview sessions
  sessions: defineTable({
    ...SESSION,
  })
    .index("by_user_id", ["userId"])
    .index("by_waiting_queuedAt", ["waiting", "queuedAt"])
    .index("by_inCall_scheduledEndTime", ["inCall", "scheduledEndTime"]),

  // first round interview evaluation; webhook from elevenlabs
  grades: defineTable({
    ...GRADE,
  }).index("by_user_id", ["userId"]),
});
