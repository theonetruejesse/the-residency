import { EmailWrapper, NameProps } from "@residency/emails/components/wrapper";

export default function RejectionEmail({ name }: NameProps) {
  return (
    <EmailWrapper name={name}>
      <p>
        thank you for taking the time to apply to the residency! we loved
        learning more about you. so. many. cool, interesting stories. it makes
        us confident the future is going to be bright!
      </p>
      <p>
        due to the small supply of rooms and the high demand for the residency,
        we cannot support all of the talented individuals who apply. so after
        careful consideration, we’ve made the difficult decision to not move
        forward with your application. that said, we know you’re going to do
        incredible things, just applying means you are someone who dreams big
        and wants to make an impact on the world. with commitment to that
        attitude, you will!
      </p>
      <p>
        we do not have the bandwidth to give personalized feedback so in
        general, if you apply again in the future, we recommend improving on at
        least one of these dimensions: excitement for what you are doing,
        clarity on what you want to achieve, your level of ambition, the
        uniqueness of your idea. we always want to help where we can so here is
        a list of grants that will hopefully help make everything you do a
        little bit easier :)
      </p>
      <p>
        please keep in touch and keep on building, we hope to support you one
        day, some way somehow.
      </p>
    </EmailWrapper>
  );
}
