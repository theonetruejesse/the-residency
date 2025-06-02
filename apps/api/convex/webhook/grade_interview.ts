import { httpAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { ELEVEN_LABS_WEBHOOK_SECRET } from "../constants";
import { Infer, v } from "convex/values";
import { CRITERIA_OPTIONS, GRADE_OPTIONS } from "../model/applicants";

export const gradeInterview = httpAction(async (ctx, request) => {
  console.log("gradeInterview webhook received");

  try {
    // Verify webhook signature and get body
    const body = await verifyWebhookSignature(request);

    // Process the interview data
    await processInterviewData(ctx, body);

    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Missing") ||
        error.message.includes("Invalid")
      ) {
        return new Response(error.message, { status: 401 });
      }
      if (error.message.includes("expired") || error.message.includes("old")) {
        return new Response("Request expired", { status: 403 });
      }
      if (error.message.includes("not configured")) {
        return new Response("Server configuration error", { status: 500 });
      }
    }

    return new Response("Internal server error", { status: 500 });
  }
});

async function verifyWebhookSignature(request: Request): Promise<string> {
  // Get the webhook signature from headers
  const signatureHeader = request.headers.get("elevenlabs-signature");
  if (!signatureHeader) {
    throw new Error("Missing ElevenLabs signature header");
  }

  // Parse the signature header more robustly
  const headerParts = signatureHeader.split(",");
  const timestampPart = headerParts.find((part) => part.startsWith("t="));
  const signaturePart = headerParts.find((part) => part.startsWith("v0="));

  if (!timestampPart || !signaturePart) {
    throw new Error("Invalid signature format");
  }

  const timestamp = parseInt(timestampPart.substring(2));
  const signature = signaturePart; // Keep the 'v0=' prefix

  // Validate timestamp (in seconds)
  const now = Math.floor(Date.now() / 1000);
  const tolerance = now - 30 * 60; // 30 minutes tolerance
  if (timestamp < tolerance) {
    throw new Error("Webhook timestamp too old");
  }

  // Get the webhook secret
  const secret = ELEVEN_LABS_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Webhook secret not configured");
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
    throw new Error("Invalid webhook signature");
  }

  return body;
}

async function processInterviewData(ctx: any, body: string): Promise<void> {
  try {
    const data = JSON.parse(body);

    // Extract necessary fields to create a grade record
    const dynamicVars =
      data?.data?.conversation_initiation_client_data?.dynamic_variables ?? {};
    const applicantIdStr: string | undefined = dynamicVars?.applicant_id;
    const conversationId: string | undefined = data?.data?.conversation_id;

    const applicantId = await ctx.runQuery(
      internal.webhook.grade_interview.getApplicantId,
      { applicantIdStr }
    );

    if (!conversationId || !applicantId) {
      console.error("Missing conversationId or applicantId in webhook payload");
      return;
    }

    // Helper to safely pull quote + rationale from data_collection_results
    const dcr =
      data?.data?.analysis?.data_collection_results ??
      ({} as Record<string, any>);

    // Extract grade data for each criteria
    const grades = [
      extractFieldData(dcr, "mission"),
      extractFieldData(dcr, "intelligence"),
      extractFieldData(dcr, "vision"),
      extractFieldData(dcr, "traction"),
      extractFieldData(dcr, "determination"),
    ];

    const interviewGradeArgs = {
      applicantId,
      conversationId,
      grades,
    };

    try {
      await ctx.runMutation(
        internal.application.interview.createInterviewGrade,
        interviewGradeArgs
      );
      await ctx.scheduler.runAfter(
        0,
        internal.application.action.downloadAudio,
        { applicantId }
      );

      console.log("Grade record inserted for user", applicantId);
    } catch (err) {
      console.error("Failed to insert grade:", err);
    }
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    throw error;
  }
}

function extractFieldData(
  dcr: Record<string, any>,
  criteria: Infer<typeof CRITERIA_OPTIONS>
): {
  rationale: string;
  quote: string;
  grade: Infer<typeof GRADE_OPTIONS>;
  criteria: Infer<typeof CRITERIA_OPTIONS>;
} {
  const obj = dcr[criteria] ?? {};
  let value = obj.value ?? "None";

  // Handle values with surrounding quotes (e.g., "\"quoted string\"")
  if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
    value = value.substring(1, value.length - 1);
  }

  // Extract grade from rationale text
  const rationale = obj.rationale ?? "";
  let grade: string = "unclear";

  // Look for grade keywords at the end of the rationale
  const gradeMatch = rationale.match(/\b(HIGH|MEDIUM|LOW|UNCLEAR)\b/i);
  if (gradeMatch) {
    grade = gradeMatch[1].toLowerCase();
  }

  return {
    rationale,
    quote: value,
    grade: grade as Infer<typeof GRADE_OPTIONS>,
    criteria,
  };
}

export const getApplicantId = internalQuery({
  args: {
    applicantIdStr: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.normalizeId("applicants", args.applicantIdStr);
  },
});
