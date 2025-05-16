import { defineSchema } from "convex/server";
import {
  Applicants,
  BasicInfo,
  Backgrounds,
  Links,
  Missions,
} from "./applicants";
import { Personas, Users } from "./users";
import { InterviewGrades, Sessions } from "./sessions";

export default defineSchema({
  applicants: Applicants.table
    .index("by_status", ["status"])
    .index("by_cohort", ["cohort"])
    .index("by_ranking", ["ranking"])
    .index("by_userId", ["userId"]),
  basicInfo: BasicInfo.table,
  missions: Missions.table,
  backgrounds: Backgrounds.table,
  links: Links.table,
  users: Users.table
    .index("by_role", ["role"])
    .index("by_basicInfoId", ["basicInfoId"]),
  personas: Personas.table,
  sessions: Sessions.table
    .index("by_applicantId", ["applicantId"])
    .index("by_waiting_queuedAt", ["waiting", "queuedAt"])
    .index("by_inCall_scheduledEndTime", ["inCall", "scheduledEndTime"]),
  interviewGrades: InterviewGrades.table.index("by_applicantId", [
    "applicantId",
  ]),
});
