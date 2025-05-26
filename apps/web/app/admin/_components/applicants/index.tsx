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
import { useState } from "react";
import { Button } from "@residency/ui/components/button";
import { Input } from "@residency/ui/components/input";
import { Search } from "lucide-react";
import { useApplicantStore } from "./query-provider";

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
            <ViewApplicants />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ApplicantQueryProvider>
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

const ViewContent = () => {
  return (
    <>
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
    </>
  );
};

const ViewHeader = () => {
  return (
    <div className="flex flex-row items-center gap-2 w-full mb-5">
      <TabsList className="shadow font-normal">
        <TabsTrigger value="pending">pending</TabsTrigger>
        <TabsTrigger value="done">done</TabsTrigger>
      </TabsList>
      <SearchBar />
    </div>
  );
};

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Connect to the store for search state
  const searchTerm = useApplicantStore((state) => state.searchTerm);
  const setSearchTerm = useApplicantStore((state) => state.setSearchTerm);
  const clearSearch = useApplicantStore((state) => state.clearSearch);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      clearSearch();
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={`flex items-center transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-10"} h-10`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0 text-muted-foreground"
        >
          <Search className="h-3 w-3" />
          <span className="sr-only">
            {isOpen ? "close search" : "open search"}
          </span>
        </Button>

        {isOpen && (
          <Input
            type="text"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary ml-1"
            autoFocus
          />
        )}
      </div>
    </div>
  );
};
