import { httpAction } from "../_generated/server";
import { ELEVEN_LABS_WEBHOOK_SECRET } from "../constants";

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
      console.log("Webhook payload:", JSON.stringify(data, null, 2));

      // Process the webhook data here
      // For example, store the data in a database or trigger another action
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
