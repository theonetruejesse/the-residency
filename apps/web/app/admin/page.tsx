import { InviteAdminForm } from "./_components/invite-admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Separator } from "@residency/ui/components/separator";
import { ListIntake } from "./_components/list-applicants/list-intake";
import { ListFirstRound } from "./_components/list-applicants/list-first-round";
import { ListSecondRound } from "./_components/list-applicants/list-second-round";

export default function AdminPage() {
  return (
    <div className="w-full mx-auto my-20 flex flex-col items-start px-4 md:px-8 lg:px-16 space-y-8">
      <ListApplicants />
      <InviteAdminForm />
    </div>
  );
}

const ListApplicants = () => {
  // todo, prefetch data
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="applicants">
        <AccordionTrigger className="text-lg font-medium lowercase">
          applicants summer 2025
        </AccordionTrigger>
        <AccordionContent>
          <Separator className="mb-8" />
          <div className="flex flex-row gap-4 overflow-x-auto pb-4">
            <ListIntake />
            <ListFirstRound />
            <ListSecondRound />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
