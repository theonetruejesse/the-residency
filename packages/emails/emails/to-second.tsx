import { EmailWrapper, NameProps } from "@residency/emails/components/wrapper";

export default function ToSecondRoundEmail({ name }: NameProps) {
  return (
    <EmailWrapper name={name}>
      <p>visionary thought you crushed it!</p>
      <p>
        we'd love for you to meet nick to see if the house is a good fit for ya
        this summer. you can find his calendar{" "}
        <a href="https://cal.com/nick-the-residency">here</a>.
      </p>
      <p>the sooner you schedule, the sooner we can get you an answer!</p>
    </EmailWrapper>
  );
}
