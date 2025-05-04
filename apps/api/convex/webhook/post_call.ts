import { v } from "convex/values";
import { httpAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { ELEVEN_LABS_WEBHOOK_SECRET } from "../constants";
import { GRADE_ARGS } from "../schema.types";

export const postCall = httpAction(async (ctx, request) => {
  console.log("postCall webhook received");

  try {
    // Get the webhook signature from headers
    const signatureHeader = request.headers.get("elevenlabs-signature");
    if (!signatureHeader) {
      console.error("Missing ElevenLabs signature header");
      return new Response("Missing signature", { status: 401 });
    }

    // Parse the signature header more robustly
    const headerParts = signatureHeader.split(",");
    const timestampPart = headerParts.find((part) => part.startsWith("t="));
    const signaturePart = headerParts.find((part) => part.startsWith("v0="));

    if (!timestampPart || !signaturePart) {
      console.error("Invalid signature format");
      return new Response("Invalid signature format", { status: 401 });
    }

    const timestamp = parseInt(timestampPart.substring(2));
    const signature = signaturePart; // Keep the 'v0=' prefix

    // Validate timestamp (in seconds)
    const now = Math.floor(Date.now() / 1000);
    const tolerance = now - 30 * 60; // 30 minutes tolerance
    if (timestamp < tolerance) {
      console.error("Webhook timestamp too old");
      return new Response("Request expired", { status: 403 });
    }

    // Get the webhook secret
    const secret = ELEVEN_LABS_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Webhook secret not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    // Get the request body
    const body = await request.text();

    // Verify the signature using Web Crypto API
    const message = `${timestamp}.${body}`;
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    // Create the HMAC key
    const key = await crypto.subtle.importKey(
      "raw",
      secretData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the message
    const signatureBytes = await crypto.subtle.sign("HMAC", key, messageData);

    // Convert the signature to hex string with v0= prefix
    const computedSignature =
      "v0=" +
      Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    if (signature !== computedSignature) {
      console.error("Invalid webhook signature");
      console.log("Expected:", signature);
      console.log("Computed:", computedSignature);
      return new Response("Request unauthorized", { status: 401 });
    }

    // Parse and log the webhook data
    try {
      const data = JSON.parse(body);
      // --------------------
      // Extract necessary fields to create a grade record
      // --------------------
      const conversationId: string | undefined = data?.data?.conversation_id;
      const dynamicVars =
        data?.data?.conversation_initiation_client_data?.dynamic_variables ??
        {};
      const userIdString: string | undefined = dynamicVars?.user_id;

      if (!conversationId || !userIdString) {
        console.error("Missing conversationId or userId in webhook payload");
      } else {
        // Helper to safely pull quote + rationale from data_collection_results
        const dcr =
          data?.data?.analysis?.data_collection_results ??
          ({} as Record<string, any>);

        const getField = (
          key: string
        ): { quote: string; rationale: string } => {
          const obj = dcr[key] ?? {};
          let value = obj.value ?? "None";

          // Handle values with surrounding quotes (e.g., "\"quoted string\"")
          if (
            value.startsWith('"') &&
            value.endsWith('"') &&
            value.length > 2
          ) {
            value = value.substring(1, value.length - 1);
          }

          return {
            quote: value,
            rationale: obj.rationale ?? "",
          };
        };

        const ap = getField("ambition_passion_quotes");
        const tr = getField("track_record_quotes");
        const id = getField("intentionality_decision_quotes");
        const rc = getField("rationale_communication_quotes");

        const gradeArgs = {
          userIdString,
          conversationId,
          ambition_passion_quotes: ap.quote,
          ambition_passion_rationale: ap.rationale,
          track_record_quotes: tr.quote,
          track_record_rationale: tr.rationale,
          intentionality_decision_quotes: id.quote,
          intentionality_decision_rationale: id.rationale,
          rationale_communication_quotes: rc.quote,
          rationale_communication_rationale: rc.rationale,
        } as any;

        try {
          await ctx.runMutation(internal.webhook.post_call.setGrade, gradeArgs);
          console.log("Grade record inserted for user", userIdString);
        } catch (err) {
          console.error("Failed to insert grade:", err);
        }
      }

      // --------------------
    } catch (error) {
      console.error("Failed to parse webhook payload:", error);
    }

    // Return 200 OK to acknowledge receipt (similar to res.status(200).send())
    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

export const setGrade = internalMutation({
  args: {
    userIdString: v.id("users"),
    ...GRADE_ARGS,
  },
  handler: async (ctx, args) => {
    const userId = ctx.db.normalizeId("users", args.userIdString);
    if (!userId) throw new Error("User not found");

    const {
      conversationId,
      ambition_passion_rationale,
      ambition_passion_quotes,
      track_record_rationale,
      track_record_quotes,
      intentionality_decision_rationale,
      intentionality_decision_quotes,
      rationale_communication_rationale,
      rationale_communication_quotes,
    } = args;

    await ctx.db.insert("grades", {
      userId,
      conversationId,
      ambition_passion_rationale,
      ambition_passion_quotes,
      track_record_rationale,
      track_record_quotes,
      intentionality_decision_rationale,
      intentionality_decision_quotes,
      rationale_communication_rationale,
      rationale_communication_quotes,
    });
  },
});
