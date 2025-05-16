import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const STATUSES_OPTIONS = v.union(
  v.literal("pending"),
  v.literal("waitlisted"),
  v.literal("accepted"),
  v.literal("rejected")
);

export const RANKING_OPTIONS = v.union(
  v.literal("likely_reject"),
  v.literal("maybe_reject"),
  v.literal("neutral"),
  v.literal("maybe_accept"),
  v.literal("likely_accept")
);

// todo: update here later
export const COHORT_OPTIONS = v.union(
  v.literal("SUMMER_2025"),
  v.literal("FALL_2025")
);

export const Applicants = Table("applicants", {
  status: STATUSES_OPTIONS,
  ranking: RANKING_OPTIONS,
  cohort: COHORT_OPTIONS,
  basicInfoId: v.id("basicInfo"),
  missionId: v.id("missions"),
  backgroundId: v.id("backgrounds"),
  linkId: v.id("links"),
  userId: v.optional(v.id("users")), // only after they pass the intake round
});

export const BasicInfo = Table("basicInfo", {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  phoneNumber: v.string(),
});

export const Missions = Table("missions", {
  interest: v.string(),
  accomplishment: v.string(),
});

export const Backgrounds = Table("backgrounds", {
  gender: v.string(),
  country: v.string(),
  college: v.optional(v.string()),
  referrals: v.optional(v.string()),
});

export const Links = Table("links", {
  twitter: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  website: v.optional(v.string()), // todo, array of url + description
});
