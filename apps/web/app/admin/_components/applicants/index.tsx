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
import { DisplayDone } from "./display-done";
import { DisplayPending } from "./display-pending";
import { SearchBar } from "./header-search-bar";
import { CriteriasSlider } from "./header-criterias-slider";

export const ListApplicants = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="applicants">
        <AccordionTrigger className="text-lg font-medium lowercase">
          applicants summer 2025
        </AccordionTrigger>
        <AccordionContent>
          <Separator className="mb-8 my-4" />
          <ViewApplicants />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ViewApplicants = () => {
  return (
    <Tabs defaultValue="pending">
      <ViewHeader />
      <ViewContent />
    </Tabs>
  );
};

const ViewHeader = () => {
  return (
    <div className="flex flex-row items-center gap-1 w-full mb-5">
      <TabsList className="shadow font-normal">
        <TabsTrigger value="pending">pending</TabsTrigger>
        <TabsTrigger value="done">done</TabsTrigger>
      </TabsList>
      <div className="ml-1">
        <CriteriasSlider />
      </div>
      <SearchBar />
    </div>
  );
};

const ViewContent = () => {
  return (
    <>
      <TabsContent value="pending">
        <DisplayPending />
      </TabsContent>
      <TabsContent value="done">
        <DisplayDone />
      </TabsContent>
    </>
  );
};
