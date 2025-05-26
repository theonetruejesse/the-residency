import { InviteAdminButton } from "./_components/invite-admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Separator } from "@residency/ui/components/separator";
import { ListIntake } from "./_components/applicants/list-intake";
import { ListFirstRound } from "./_components/applicants/list-first-round";
import { ListSecondRound } from "./_components/applicants/list-second-round";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@residency/ui/components/tabs";
import { DisplayDone } from "./_components/applicants/list-done";
import { KanbanWrapper } from "./_components/applicants/wrappers";

export default function AdminPage() {
  return (
    <div className="w-full mx-auto my-20 flex flex-col items-start px-4 md:px-8 lg:px-16 space-y-8">
      <ListApplicants />
      <InviteAdminButton />
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
          <Separator className="mb-8 my-4" />
          <ApplicantsTabs />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ApplicantsTabs = () => {
  return (
    <Tabs defaultValue="pending">
      <TabsList className="shadow mb-5 flex-1 font-normal">
        <TabsTrigger value="pending">pending</TabsTrigger>
        <TabsTrigger value="done">done</TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <KanbanWrapper>
          <ListIntake />
          <ListFirstRound />
          <ListSecondRound />
        </KanbanWrapper>
      </TabsContent>
      <TabsContent value="done">
        <DisplayDone />
      </TabsContent>
    </Tabs>
  );
};
