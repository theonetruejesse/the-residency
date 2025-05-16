import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const ROLE_OPTIONS = v.union(
  v.literal("admin"),
  v.literal("resident"),
  v.literal("alumni")
);

export const Users = Table("users", {
  role: ROLE_OPTIONS,
  clerkId: v.string(),
  basicInfoId: v.id("basicInfo"),
  missionId: v.id("missions"),
  backgroundId: v.id("backgrounds"),
  linkId: v.id("links"),
});
