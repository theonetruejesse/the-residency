"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "@residency/ui/components/button";
import { ArrowDown } from "lucide-react";

type Section = "links" | "questions";

export const SectionDivider = ({ section }: { section: Section }) => (
  <div className="relative flex items-center py-2">
    <span className="flex-shrink mr-4 text-gray-600 font-medium text-lg">
      {section}
    </span>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

interface SectionContextType {
  visibleSections: {
    links: boolean;
    questions: boolean;
  };
  showSection: (section: Section) => void;
}
const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const SectionProvider = ({ children }: { children: ReactNode }) => {
  const [visibleSections, setVisibleSections] = useState({
    links: false,
    questions: false,
  });

  const showSection = (section: Section) => {
    setVisibleSections((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  return (
    <SectionContext.Provider value={{ visibleSections, showSection }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSectionVisibility = () => {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error(
      "useSectionVisibility must be used within a SectionProvider"
    );
  }
  return context;
};

export const NextSectionButton = ({ section }: { section: Section }) => {
  const { showSection } = useSectionVisibility();

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        onClick={() => showSection(section)}
        variant="default"
        className="flex items-center gap-2"
      >
        {section}
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
