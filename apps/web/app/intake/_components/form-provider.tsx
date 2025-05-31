"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useAction } from "convex/react";
import { api } from "@residency/api";
import { FormData, FormErrors } from "./form-types";
import { IntakeData, saveIntakeData } from "../_store/redis-intake";

// Extended FormErrors type that includes a form-level error
type ExtendedFormErrors = FormErrors & { form?: string };

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
interface FormProviderProps {
  children: ReactNode;
  intakeId: string;
  initialData: IntakeData;
}
export function FormProvider({
  children,
  intakeId,
  initialData,
}: FormProviderProps) {
  const [formData, setFormData] = useState<FormData>(initialData.formData);
  const [errors, setErrors] = useState<ExtendedFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitIntake = useAction(api.application.index.submitIntake);

  useEffect(() => {
    const saveData = async () => {
      await saveIntakeData(intakeId, formData);
    };

    const debounceTimer = setTimeout(saveData, 5000); // 5 seconds
    return () => clearTimeout(debounceTimer);
  }, [formData, intakeId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: ExtendedFormErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.country) newErrors.country = "Country is required";

    if (!formData.interest) newErrors.interest = "This field is required";
    if (!formData.accomplishment)
      newErrors.accomplishment = "This field is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isSuccess = false;

    if (!validateForm()) {
      return false;
    }

    try {
      setIsSubmitting(true);

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

  const value = {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSelectChange,
    validateForm,
    handleSubmit,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useForm() {
  const context = useContext(FormContext);

  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }

  return context;
}
