import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const ROLE_OPTIONS = v.union(
  v.literal("admin"),
  v.literal("resident"),
  v.literal("applicant"),
  v.literal("alumni")
);

export const Users = Table("users", {
  role: ROLE_OPTIONS,
  clerkId: v.optional(v.string()), // updated by clerk webhook
  basicInfoId: v.id("basicInfo"),
  missionId: v.optional(v.id("missions")),
  backgroundId: v.optional(v.id("backgrounds")),
  linkId: v.optional(v.id("links")),
});
