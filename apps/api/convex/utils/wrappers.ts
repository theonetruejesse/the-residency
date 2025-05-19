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
import { Users } from "../model/users";
import { Infer } from "convex/values";

// Type for user data matching the Users.table.validator (without system fields)
type UserData = Infer<typeof Users.table.validator>;

/**
 * Ensures the user is authenticated and returns their user record (without system fields).
 * Throws if not authenticated or user not found.
 */
export async function AuthenticationRequired<
  C extends ActionCtx | MutationCtx | QueryCtx,
>({ ctx }: { ctx: C }): Promise<{ user: UserData }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const clerkId = identity.subject;
  const user = await ctx.runQuery(internal.application.user.getUserByClerkId, {
    clerkId,
  });
  if (!user) {
    throw new Error("Not authorized");
  }
  return { user };
}

// ADMIN WRAPPERS (authenticated + role check)
export const adminAction = customAction(
  action,
  customCtx(async (ctx) => {
    const { user } = await AuthenticationRequired({ ctx });
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }
    return { user };
  })
);

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const { user } = await AuthenticationRequired({ ctx });
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }
    return { user };
  })
);

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const { user } = await AuthenticationRequired({ ctx });
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }
    return { user };
  })
);

// USER WRAPPERS (authenticated only)
export const userAction = customAction(
  action,
  customCtx(async (ctx) => {
    return await AuthenticationRequired({ ctx });
  })
);

export const userMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    return await AuthenticationRequired({ ctx });
  })
);

export const userQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    return await AuthenticationRequired({ ctx });
  })
);
