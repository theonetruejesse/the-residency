import { Button } from "@react-email/components";
import { EmailWrapper } from "@residency/emails/components/wrapper";

export default function ApproveFirstRoundEmail() {
  return (
    <EmailWrapper>
      <Button
        href="https://example.com"
        className="bg-brand px-3 py-2 font-medium leading-4 text-white"
      >
        Click me
      </Button>
    </EmailWrapper>
  );
}
