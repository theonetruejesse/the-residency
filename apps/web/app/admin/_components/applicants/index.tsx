"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@residency/ui/components/accordion";
import { Separator } from "@residency/ui/components/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@residency/ui/components/tabs";
import { KanbanWrapper } from "./helper-wrappers";
import { DisplayDone } from "./list-done";
import { ListFirstRound } from "./list-first-round";
import { ListIntake } from "./list-intake";
import { ListSecondRound } from "./list-second-round";
import { ApplicantQueryProvider } from "./query-provider";

export const ListApplicants = () => {
  return (
    <ApplicantQueryProvider>
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
    </ApplicantQueryProvider>
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
        <DisplayPending />
      </TabsContent>
      <TabsContent value="done">
        <DisplayDone />
      </TabsContent>
    </Tabs>
  );
};

const DisplayPending = () => {
  return (
    <KanbanWrapper>
      <ListIntake />
      <ListFirstRound />
      <ListSecondRound />
    </KanbanWrapper>
  );
};
