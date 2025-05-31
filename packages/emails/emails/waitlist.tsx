import { EmailWrapper, NameProps } from "@residency/emails/components/wrapper";

export default function WaitlistEmail({ name }: NameProps) {
  return (
    <EmailWrapper name={name}>
      <p>
        we got so many more applications than anticipated for the inventor's
        residency this summer.
      </p>

      <p>
        that said, we need until friday to get back to you about the status of
        your application. we want to make sure we are curating the best possible
        cohort for everyone involved.
      </p>
      <p>
        if you are getting this email, that means you are one of the more
        exceptional people we've screened :) so congratulations!
      </p>
    </EmailWrapper>
  );
}
