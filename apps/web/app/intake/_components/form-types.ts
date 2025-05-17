import type { Id } from "@residency/api";
import type React from "react";

export interface ResidencyFormProps {
  setUserId: (userId: Id<"users">) => void;
}

export type FormData = {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // Backgrounds
  gender: string;
  country: string;
  college: string;
  referrals: string;
  // Links
  twitter: string;
  linkedin: string;
  github: string;
  website: string;
  // Missions
  interest: string;
  accomplishment: string;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export type BasicInfoSectionProps = {
  formData: FormData;
  errors: FormErrors & { form?: string };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: (name: string, value: string) => void;
};

export type LinksSectionProps = {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export type QuestionsSectionProps = {
  formData: FormData;
  errors: FormErrors & { form?: string };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};
