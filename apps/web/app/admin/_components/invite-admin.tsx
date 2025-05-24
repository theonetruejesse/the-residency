"use client";

import { Label } from "@residency/ui/components/label";
import { Input } from "@residency/ui/components/input";
import { RequiredIndicator } from "@/components/required-indicator";
import { ActionButton } from "@/components/action-button";
import { useState } from "react";
import { api } from "@residency/api";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { Button } from "@residency/ui/components/button";
import { CirclePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@residency/ui/components/dialog";

export const InviteAdminButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-6 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        size="lg"
      >
        invite admin
        <CirclePlus className="w-4 h-4 mr-2" />
      </Button>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>invite admin</DialogTitle>
          </DialogHeader>
          <InviteAdminForm onSuccess={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

interface InviteAdminFormProps {
  onSuccess?: () => void;
}

const InviteAdminForm = ({ onSuccess }: InviteAdminFormProps) => {
  const { errors, isSubmitting, handleChange, handleSubmit, formData } =
    useInviteForm(onSuccess);

  return (
    <div className="mx-2 w-full">
      <form
        className="space-y-4 p-8 space-y-6"
        onSubmit={async (e) => {
          await handleSubmit(e);
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="first name"
            name="firstName"
            value={formData.firstName}
            errors={errors}
            onChange={handleChange}
          />
          <InputField
            label="last name"
            name="lastName"
            value={formData.lastName}
            errors={errors}
            onChange={handleChange}
          />
        </div>
        <InputField
          label="phone number"
          name="phoneNumber"
          value={formData.phoneNumber}
          errors={errors}
          onChange={handleChange}
        />
        <InputField
          label="email"
          name="email"
          type="email"
          value={formData.email}
          errors={errors}
          onChange={handleChange}
        />
        <ActionButton
          actionText="send invite"
          loadingText="sending..."
          isDisabled={isSubmitting}
          type="submit"
        />
      </form>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  errors?: InviteFormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const InputField = ({
  label,
  name,
  errors = {},
  type = "text",
  value,
  onChange,
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700" htmlFor={name}>
        {label}
        <RequiredIndicator />
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder=""
        onChange={onChange}
        className={`bg-white/50 border-gray-200 ${
          errors[name as keyof InviteFormErrors] ? "border-red-500" : ""
        }`}
      />
    </div>
  );
};

const DEFAULT_FORM_DATA: InviteFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

const useInviteForm = (onSuccess?: () => void) => {
  const inviteAdmin = useAction(api.application.admin.inviteAdmin);
  const [formData, setFormData] = useState<InviteFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<InviteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: InviteFormErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await inviteAdmin({ basicInfo: formData });
      toast.success(`invite sent to ${formData.email}`);
      setFormData(DEFAULT_FORM_DATA);
      onSuccess?.();
    } catch (error) {
      setErrors({
        ...errors,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};

type InviteFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

type InviteFormErrors = Partial<Record<keyof InviteFormData, string>>;
