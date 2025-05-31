"use node";

// https://github.com/resend/react-email/issues/1630
// Polyfill MessageChannel for Convex Node.js environment
if (typeof MessageChannel === "undefined") {
  class MockMessagePort {
    onmessage: ((ev: MessageEvent) => void) | undefined;
    onmessageerror: ((ev: MessageEvent) => void) | undefined;
    close() {}
    postMessage(_message: unknown, _transfer: Transferable[] = []) {}
    start() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent(_event: Event): boolean {
      return false;
    }
  }

  class MockMessageChannel {
    port1: MockMessagePort;
    port2: MockMessagePort;
    constructor() {
      this.port1 = new MockMessagePort();
      this.port2 = new MockMessagePort();
    }
  }

  globalThis.MessageChannel =
    MockMessageChannel as unknown as typeof MessageChannel;
}

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { EMAIL_ADDRESS, resendClient } from "../constants";
import { render } from "@react-email/components";
import IntakeConfirmationEmail from "@residency/emails/intake-confirmation";
import WaitlistEmail from "@residency/emails/waitlist";
import RejectionEmail from "@residency/emails/rejection";
import ToFirstRoundEmail from "@residency/emails/to-first";
import ToSecondRoundEmail from "@residency/emails/to-second";

const EMAIL_TYPES = v.union(
  v.literal("intake-confirmation"),
  v.literal("waitlist"),
  v.literal("rejection"),
  v.literal("to-first"),
  v.literal("to-second")
);

export const sendEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    emailType: EMAIL_TYPES,
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const { email, name } = args;

    let html: string | null = null;
    let subject: string | null = null;

    switch (args.emailType) {
      case "intake-confirmation":
        html = await render(IntakeConfirmationEmail({ name }));
        subject = "the residency: application received";
        break;
      case "waitlist":
        html = await render(WaitlistEmail({ name }));
        subject = "the residency: final decision";
        break;
      case "rejection":
        html = await render(RejectionEmail({ name }));
        subject = "the residency: final decision";
        break;
      case "to-first":
        html = await render(ToFirstRoundEmail({ name }));
        subject = "the residency: application decision";
        break;
      case "to-second":
        html = await render(ToSecondRoundEmail({ name }));
        subject = "the residency: interview decision";
        break;
    }

    if (!html || !subject) throw new Error("No valid values found");

    await resendClient.emails.send({
      from: `The Residency <${EMAIL_ADDRESS}>`,
      to: email,
      subject,
      html,
    });
  },
});
