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
import { ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@residency/ui/components/select";

export const INITIAL_FORM_DATA: FormData = {
  // Basic Info
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",

  // Backgrounds
  gender: "",
  country: "",
  college: "",
  referrals: "",

  // Links
  twitter: "",
  linkedin: "",
  github: "",
  website: "",

  // Missions
  interest: "",
  accomplishment: "",
};

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
export const TextField = ({
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
};

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

export const SelectField = ({
  labelName,
  fieldName,
  formData,
  onValueChange,
  options,
  errors = {},
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="text-gray-700">
        {labelName}
        <RequiredIndicator />
      </Label>
      <Select
        value={formData[fieldName as keyof FormData] as string}
        onValueChange={(value) => onValueChange(fieldName, value)}
      >
        <SelectTrigger
          id={fieldName}
          className={`bg-white/50 border-gray-200 w-full ${errors[fieldName] ? "border-red-500" : ""}`}
        >
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface TextareaFieldProps {
  labelName: string;
  fieldName: string;
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  errors?: Record<string, string>;
  placeholder: string;
}

export const TextareaField = ({
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
};

// Specialized LinkField component for links section
export interface LinkFieldProps {
  labelName: string;
  fieldName: string;
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

export const LinkField = ({
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
};
