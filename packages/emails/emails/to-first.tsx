import { EmailWrapper, NameProps } from "@residency/emails/components/wrapper";

export default function ToFirstRoundEmail({ name }: NameProps) {
  return (
    <EmailWrapper name={name}>
      <p>
        we loved your application for the residency and want to learn more about
        you.
      </p>
      <p>
        your next step is to have a call with visionary, our ai interviewer. you
        should have received another email for you to create a residency
        account.
      </p>
      <p>
        once you have an account, you will be able to start the call whenever
        convenient for you.
      </p>
    </EmailWrapper>
  );
}
