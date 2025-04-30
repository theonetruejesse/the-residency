"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@residency/ui/components/button";
import { Input } from "@residency/ui/components/input";
import { Label } from "@residency/ui/components/label";
import { Textarea } from "@residency/ui/components/textarea";
import { useMutation } from "convex/react";
import { api, Id } from "@residency/api";

interface ResidencyFormProps {
  setUserId: (userId: Id<"users">) => void;
}

export function ResidencyForm({ setUserId }: ResidencyFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    interest: "",
    accomplishment: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitIntake = useMutation(api.user.application.submitIntake);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    const userId = await submitIntake(formData);
    setUserId(userId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-6 rounded-lg glass mx-2"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            The Residency Application
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder=""
              required
              className="bg-white/50 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder=""
              required
              className="bg-white/50 border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest" className="text-gray-700">
            What do you want to build, create, or investigate during your
            residency?
          </Label>
          <Textarea
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            placeholder="Share your ideas and goals..."
            required
            className="min-h-[120px] bg-white/50 border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accomplishment" className="text-gray-700">
            What are 2-3 things you are most proud of?
          </Label>
          <Textarea
            id="accomplishment"
            name="accomplishment"
            value={formData.accomplishment}
            onChange={handleChange}
            placeholder="Tell us about your achievements..."
            required
            className="min-h-[120px] bg-white/50 border-gray-200"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-black hover:bg-black/80 text-white"
        >
          Submit Application
        </Button>
      </form>
    </div>
  );
}
