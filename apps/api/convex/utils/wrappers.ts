import {
  action,
  mutation,
  query,
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";
import { internal } from "../_generated/api";
import {
  customAction,
  customMutation,
  customQuery,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { Doc } from "../_generated/dataModel";
import { UserApplicant } from "../types/application.types";

async function AuthenticationRequired<
  C extends ActionCtx | MutationCtx | QueryCtx,
>({ ctx }: { ctx: C }): Promise<{ user: Doc<"users"> }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const clerkId = identity.subject;
  const user = await ctx.runQuery(internal.application.user.getUserByClerkId, {
    clerkId,
  });
  if (!user) throw new Error("Not authorized");
  return { user };
}

const adminFn = async (ctx: ActionCtx | MutationCtx | QueryCtx) => {
  const { user } = await AuthenticationRequired({ ctx });
  if (user.role !== "admin") throw new Error("Not authorized");
  return { user };
};

const uaFn = async (
  ctx: ActionCtx | MutationCtx | QueryCtx
): Promise<UserApplicant> => {
  const { user } = await AuthenticationRequired({ ctx });

  const applicant = await ctx.runQuery(
    internal.application.applicant.getUserApplicant,
    { userId: user._id }
  );
  if (!applicant) throw new Error("Applicant not found");

  return { user, applicant };
};

const userFn = async (
  ctx: ActionCtx | MutationCtx | QueryCtx
): Promise<{ user: Doc<"users"> }> => {
  return await AuthenticationRequired({ ctx });
};

export const adminMutation = customMutation(mutation, customCtx(adminFn));
export const adminQuery = customQuery(query, customCtx(adminFn));

export const userApplicantAction = customAction(action, customCtx(uaFn));
export const userApplicantMutation = customMutation(mutation, customCtx(uaFn));
export const userApplicantQuery = customQuery(query, customCtx(uaFn));

export const userQuery = customQuery(query, customCtx(userFn));
