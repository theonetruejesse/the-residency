import { Button } from "@react-email/components";
import { EmailWrapper } from "@residency/emails/components/wrapper";

// not used yet
export default function AcceptanceEmail() {
  return (
    <EmailWrapper>
      <Button
        href="https://example.com"
        className="px-3 py-2 font-medium leading-4"
      >
        Click me.
      </Button>
      <p>todo2</p>
    </EmailWrapper>
  );
}
