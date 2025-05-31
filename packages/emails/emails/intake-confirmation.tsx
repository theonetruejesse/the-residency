import { EmailWrapper, NameProps } from "@residency/emails/components/wrapper";

export default function IntakeConfirmationEmail({ name }: NameProps) {
  return (
    <EmailWrapper name={name}>
      <p>congrats on finishing your application!</p>
      <p>
        if you make it to the next stage, we'll send you an ai interviewer to
        get to know you more 🚀  
      </p>
      <p>have a great day!</p>
    </EmailWrapper>
  );
}
