import { Card } from "@residency/ui/components/card";

export const ChaliceChatCopy = (props: { firstName: string }) => {
  return (
    <Card className="flex flex-col items-center gap-4 glass p-8 mb-4 lowercase">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">
          Hi {props.firstName}! Welcome to Chalice Chat.
        </h1>

        <div className="flex flex-col gap-4 text-md text-gray-800">
          <p>This is your first round interview for The Residency.</p>
          <p>
            We&apos;ve designed this conversation to feel like a day in the life
            at The Residency: casual yet technical. Think of this interview as a
            coffee chat that doesn&apos;t drain your energy. Instead, we&apos;re
            eager to hear about your technical journey, what drives you, and the
            ideas you&apos;re currently the most passionate about.
          </p>
          <p>
            Our AI interviewer will guide the conversation based on our
            program&apos;s criteria, so just focus on sharing what excites you.
            Chalice Chat is designed to give you plenty of space to discuss your
            interests and experiences. Most importantly, we want you to enjoy a
            delightful conversation where you&apos;re free to nerd out as much
            as you&apos;d like.
          </p>
        </div>

        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2 underline">
            Call Logistics:
          </h2>
          <ul className="list-disc list-inside text-md text-gray-800 space-y-1">
            <li>
              Please join from a quiet environment with a working microphone.
            </li>
            <li>The call is 10 minutes and cannot be paused once started.</li>
            <li>
              Please start the interview within 5 minutes of joining (otherwise
              you&apos;ll get cut off early).
            </li>
            <li>
              All interviews are reviewed by both agentic and human evaluators.
            </li>
            <li>
              If you encounter any technical issues, contact
              <a
                href="mailto:support@livetheresidency.com"
                className="underline ml-1"
              >
                support@livetheresidency.com
              </a>
              .
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-start w-full">
          <p className="text-md text-gray-800">
            We&apos;re excited to get a glimpse into your journey during our
            Chalice Chat!
          </p>
        </div>
      </div>
    </Card>
  );
};
