"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Separator } from "@residency/ui/components/separator";
import { IntakeApplicants } from "./intake-applicants";
import { FirstRoundApplicants } from "./first-round-applicants";
export const ApplicantList = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="applicants">
        <AccordionTrigger className="text-lg font-medium lowercase">
          applicants summer 2025
        </AccordionTrigger>
        <AccordionContent>
          <Separator className="mb-8" />
          <div className="flex flex-row gap-4">
            <IntakeApplicants />
            <FirstRoundApplicants />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
