import {
  httpAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { CLERK_WEBHOOK_SIGNING_SECRET } from "../constants";
import { v } from "convex/values";

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  switch (event.type) {
    case "user.created": {
      const clerkId = event.data.id;

      const convexUserId = event.data.public_metadata.convexUserId as string;
      const userId = await ctx.runQuery(
        internal.webhook.handle_clerk.normalizeUserId,
        { convexUserId }
      );

      if (!userId) {
        console.log("User not found", convexUserId);
        break;
      }

      await ctx.runMutation(internal.webhook.handle_clerk.setUserClerkId, {
        userId,
        clerkId,
      });

      break;
    }
    default: {
      console.log("ignored Clerk webhook event", event.type);
    }
  }
  return new Response(null, {
    status: 200,
  });
});

export const setUserClerkId = internalMutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      clerkId: args.clerkId,
    });
  },
});

export const normalizeUserId = internalQuery({
  args: {
    convexUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.normalizeId("users", args.convexUserId);
  },
});

const validateRequest = async (
  req: Request
): Promise<WebhookEvent | undefined> => {
  const payloadString = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET as string);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payloadString, svixHeaders) as Event;
  } catch (_) {
    console.log("error verifying");
    return;
  }

  return evt as unknown as WebhookEvent;
};
