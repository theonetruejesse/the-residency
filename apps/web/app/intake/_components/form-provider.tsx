"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "@residency/api";
import { FormData, FormErrors } from "./form-types";

const INITIAL_FORM_DATA: FormData = {
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

// Extended FormErrors type that includes a form-level error
type ExtendedFormErrors = FormErrors & { form?: string };

// Context interface
interface FormContextType {
  formData: FormData;
  errors: ExtendedFormErrors;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
  isSubmitting: boolean;
}

// Create the context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider component
export function FormProvider({ children }: { children: ReactNode }) {
  // Form data state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Form validation state
  const [errors, setErrors] = useState<ExtendedFormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation for submitting the form
  const submitIntake = useMutation(api.application.index.submitIntake);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: ExtendedFormErrors = {};

    // Basic required fields
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.country) newErrors.country = "Country is required";

    // Mission fields
    if (!formData.interest) newErrors.interest = "This field is required";
    if (!formData.accomplishment)
      newErrors.accomplishment = "This field is required";

    // Update errors state
    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isSuccess = false;

    // Validate form
    if (!validateForm()) {
      return false;
    }

    try {
      setIsSubmitting(true);

      // Transform formData to the expected structure
      const transformedData = {
        basicInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
        background: {
          gender: formData.gender,
          country: formData.country,
          college: formData.college || undefined,
          referrals: formData.referrals || undefined,
        },
        link: {
          twitter: formData.twitter || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          website: formData.website || undefined,
        },
        mission: {
          interest: formData.interest,
          accomplishment: formData.accomplishment,
        },
      };

      await submitIntake(transformedData);
      isSuccess = true;
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        ...errors,
        form: "An error occurred while submitting the form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }

    return isSuccess;
  };

  // Context value
  const value = {
    formData,
    errors,
    handleChange,
    handleSelectChange,
    validateForm,
    handleSubmit,
    isSubmitting,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

// Custom hook to use the form context
export function useForm() {
  const context = useContext(FormContext);

  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }

  return context;
}
