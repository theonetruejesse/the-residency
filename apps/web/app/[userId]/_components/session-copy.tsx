export const SessionCopy = (props: { userName: string }) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-bold">
        Hi {props.userName}! Welcome to Chalice Chat.
      </h1>

      <div className="flex flex-col gap-4 text-md text-gray-800">
        <p>This is your first round interview for The Residency.</p>
        <p>
          We’ve designed this conversation to feel like a day in the life at The
          Residency: casual yet technical. Think of it as an open chat with a
          smart, genuinely curious peer—someone eager to hear about your
          research journey, what drives you, and the ideas you’re most
          passionate about.
        </p>
        <p>
          Our AI interviewer will guide the conversation based on our program’s
          criteria, so you can simply focus on sharing what excites you. The
          Chalice Chat is structured to give you plenty of space to talk about
          your interests and experiences. Most importantly, we want you to enjoy
          a delightful conversation where you’re free to nerd out as much as
          you’d like.
        </p>
      </div>

      <div className="w-full">
        <h2 className="text-lg font-semibold mt-4 mb-2">Call Logistics:</h2>
        <ul className="list-disc list-inside text-md text-gray-800 space-y-1">
          <li>
            Please join from a quiet environment with a working microphone.
          </li>
          <li>The call is 15 minutes and cannot be paused once started.</li>
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
          We’re excited to get a glimpse into your journey during our Chalice
          Chat!
        </p>
      </div>
    </div>
  );
};
