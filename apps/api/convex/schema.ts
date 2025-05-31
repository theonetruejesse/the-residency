import { defineSchema } from "convex/server";
import {
  Applicants,
  BasicInfo,
  Backgrounds,
  Links,
  Missions,
  Grades,
  Interviews,
  Notes,
} from "./model/applicants";
import { Users } from "./model/users";
import { Personas, Sessions } from "./model/sessions";

export default defineSchema({
  applicants: Applicants.table
    .index("by_status", ["cohort", "status"])
    .index("by_cycle", ["cohort", "round", "status"])
    .index("by_userId", ["userId"]),
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
    .index("by_inCall", ["inCall"]),
  personas: Personas.table.index("by_sessionId", ["sessionId"]),
  interviews: Interviews.table.index("by_applicantId", ["applicantId"]),
  grades: Grades.table.index("by_interviewId", ["interviewId"]),
  notes: Notes.table.index("by_applicantId", ["applicantId"]),
});
