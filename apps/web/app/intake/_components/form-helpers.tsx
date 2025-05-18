import type { FormData } from "./form-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@residency/ui/components/tooltip";
import { Input } from "@residency/ui/components/input";
import { Label } from "@residency/ui/components/label";
import { Textarea } from "@residency/ui/components/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@residency/ui/components/command";
import { ChangeEvent, memo, useState, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@residency/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@residency/ui/components/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@residency/ui/lib/utils";
import { Button } from "@residency/ui/components/button";

// Required field indicator with tooltip
const RequiredIndicator = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-red-500 ml-[-3px]">*</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>This field is required</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Reusable TextField component
interface TextFieldProps {
  labelName: string;
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  required?: boolean;
  type?: string;
  fieldName: string;
}
export const TextField = memo(
  ({
    labelName,
    formData,
    onChange,
    errors = {},
    required = false,
    fieldName,
  }: TextFieldProps) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-gray-700">
          {labelName}
          {required && <RequiredIndicator />}
        </Label>
        <Input
          id={fieldName}
          name={fieldName}
          type="text"
          value={formData[fieldName as keyof FormData] as string}
          onChange={onChange}
          placeholder=""
          className={`bg-white/50 border-gray-200 ${
            errors[fieldName] ? "border-red-500" : ""
          }`}
        />
      </div>
    );
  }
);
TextField.displayName = "TextField";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  labelName: string;
  fieldName: string;
  formData: FormData;
  onValueChange: (name: string, value: string) => void;
  options: SelectOption[];
  errors?: Record<string, string>;
}

export const SelectField = memo(
  ({
    labelName,
    fieldName,
    formData,
    onValueChange,
    options,
    errors = {},
  }: SelectFieldProps) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = useCallback((open: boolean) => {
      setOpen(open);
    }, []);

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-gray-700">
          {labelName}
          <RequiredIndicator />
        </Label>
        <Select
          value={formData[fieldName as keyof FormData] as string}
          onValueChange={(value) => onValueChange(fieldName, value)}
          onOpenChange={handleOpenChange}
          open={open}
        >
          <SelectTrigger
            id={fieldName}
            className={`bg-white/50 border-gray-200 w-full ${errors[fieldName] ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {open && (
              <div className="py-1">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }
);
SelectField.displayName = "SelectField";

interface TextareaFieldProps {
  labelName: string;
  fieldName: string;
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  errors?: Record<string, string>;
  placeholder: string;
}

export const TextareaField = memo(
  ({
    labelName,
    fieldName,
    formData,
    onChange,
    errors = {},
    placeholder,
  }: TextareaFieldProps) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-gray-700">
          {labelName}
          <RequiredIndicator />
        </Label>
        <Textarea
          id={fieldName}
          name={fieldName}
          value={formData[fieldName as keyof FormData] as string}
          onChange={onChange}
          placeholder={placeholder}
          className={`min-h-[120px] bg-white/50 border-gray-200 ${
            errors[fieldName] ? "border-red-500" : ""
          }`}
        />
      </div>
    );
  }
);
TextareaField.displayName = "TextareaField";

// Specialized LinkField component for links section
export interface LinkFieldProps {
  labelName: string;
  fieldName: string;
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

export const LinkField = memo(
  ({
    labelName,
    fieldName,
    formData,
    onChange,
    placeholder,
  }: LinkFieldProps) => {
    return (
      <div className="flex items-center gap-4">
        <Label htmlFor={fieldName} className="text-gray-700 w-24 flex-shrink-0">
          {labelName}
        </Label>
        <Input
          id={fieldName}
          name={fieldName}
          value={formData[fieldName as keyof FormData] as string}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-white/50 border-gray-200 flex-grow"
        />
      </div>
    );
  }
);
LinkField.displayName = "LinkField";

// Special optimized component for country selection with Combobox
export const CountrySelectField = memo(
  ({
    labelName,
    fieldName,
    formData,
    onValueChange,
    options,
    errors = {},
  }: SelectFieldProps) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const value = formData[fieldName as keyof FormData] as string;

    // Filter options based on search query - search both label and value
    const filteredOptions = useMemo(() => {
      if (!inputValue) return options;

      const lowerQuery = inputValue.toLowerCase();
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(lowerQuery) ||
          option.value.toLowerCase().includes(lowerQuery)
      );
    }, [options, inputValue]);

    const selectedCountry = useMemo(() => {
      return options.find((option) => option.value === value)?.label || "";
    }, [options, value]);

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-gray-700">
          {labelName}
          <RequiredIndicator />
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              id={fieldName}
              className={`w-full justify-between bg-white/50 text-left font-normal h-9 px-3 py-2 ${errors[fieldName] ? "border-red-500" : "border-gray-200"}`}
            >
              <span className="flex-grow truncate">
                {selectedCountry || ""}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command
              filter={(value, search) => {
                // Disable the built-in filtering
                return 1;
              }}
            >
              <CommandInput
                placeholder="Search country..."
                value={inputValue}
                onValueChange={setInputValue}
                className="h-9"
              />
              <CommandList className="max-h-[300px] overflow-auto">
                {filteredOptions.length === 0 && (
                  <CommandEmpty>No country found.</CommandEmpty>
                )}
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onValueChange(fieldName, currentValue);
                        setOpen(false);
                        setInputValue("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors[fieldName] && (
          <p className="text-sm text-red-500 mt-1">{errors[fieldName]}</p>
        )}
      </div>
    );
  }
);
CountrySelectField.displayName = "CountrySelectField";
