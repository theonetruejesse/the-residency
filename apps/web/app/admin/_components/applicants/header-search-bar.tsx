"use client";

import { Button } from "@residency/ui/components/button";
import { Input } from "@residency/ui/components/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSearch } from "./query-hooks";

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();

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
