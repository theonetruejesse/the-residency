import { defineSchema } from "convex/server";
import {
  Applicants,
  BasicInfo,
  Backgrounds,
  Links,
  Missions,
} from "./model/applicants";
import { Users } from "./model/users";
import { InterviewGrades, Personas, Sessions } from "./model/sessions";

export default defineSchema({
  applicants: Applicants.table
    .index("by_status", ["status"])
    .index("by_cohort", ["cohort"])
    .index("by_ranking", ["ranking"])
    .index("by_userId", ["userId"])
    .index("by_cycle", ["cohort", "round", "status"]),
  basicInfo: BasicInfo.table,
  missions: Missions.table,
  backgrounds: Backgrounds.table,
  links: Links.table,
  users: Users.table
    .index("by_role", ["role"])
    .index("by_basicInfoId", ["basicInfoId"])
    .index("by_clerkId", ["clerkId"]),
  sessions: Sessions.table
    .index("by_applicantId", ["applicantId"])
    .index("by_waiting_queuedAt", ["waiting", "queuedAt"])
    .index("by_inCall_scheduledEndTime", ["inCall", "scheduledEndTime"]),
  personas: Personas.table.index("by_sessionId", ["sessionId"]),
  interviewGrades: InterviewGrades.table.index("by_applicantId", [
    "applicantId",
  ]),
});
