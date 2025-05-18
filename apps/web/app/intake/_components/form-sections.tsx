"use client";

import type React from "react";
import { ActionButton } from "@/components/action-button";
import { memo, useMemo } from "react";

import {
  COMMON_COUNTRIES,
  ALL_COUNTRIES,
  GENDER_SELECT_OPTIONS,
  LINK_FIELDS,
} from "@/app/intake/_components/field-options";
import {
  TextField,
  SelectField,
  TextareaField,
  LinkField,
  CountrySelectField,
} from "./form-helpers";
import {
  SectionDivider,
  NextSectionButton,
  useSectionVisibility,
} from "./section-provider";
import { useForm } from "./form-provider";

export const FormSectionController = memo(() => {
  const { visibleSections } = useSectionVisibility();

  return (
    <>
      {/* Links Section Button (only show if section is not visible) */}
      {!visibleSections.links ? (
        <NextSectionButton section="links" />
      ) : (
        <LinksSection />
      )}

      {/* Questions Section Button (only show if links section is visible and questions section is not) */}
      {visibleSections.links && !visibleSections.questions && (
        <NextSectionButton section="questions" />
      )}

      {/* Questions Section */}
      {visibleSections.questions && <QuestionsSection />}
    </>
  );
});
FormSectionController.displayName = "FormSectionController";

export const BasicInfoSection = memo(() => {
  const { formData, errors, handleChange, handleSelectChange } = useForm();

  // Memoize the options to prevent recreating them on every render
  const genderOptions = useMemo(() => GENDER_SELECT_OPTIONS, []);

  // Use pre-structured data for better performance - no separator
  const countryOptions = useMemo(() => {
    // Just combine the arrays without a separator
    return [...COMMON_COUNTRIES, ...ALL_COUNTRIES];
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          labelName="first name"
          fieldName="firstName"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          required={true}
        />
        <TextField
          labelName="last name"
          fieldName="lastName"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          required={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          labelName="email"
          fieldName="email"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          required={true}
          type="email"
        />
        <TextField
          labelName="phone number"
          fieldName="phoneNumber"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          required={true}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          labelName="gender"
          fieldName="gender"
          formData={formData}
          onValueChange={handleSelectChange}
          options={genderOptions}
          errors={errors}
        />
        <CountrySelectField
          labelName="country of citizenship"
          fieldName="country"
          formData={formData}
          onValueChange={handleSelectChange}
          options={countryOptions}
          errors={errors}
        />
        <TextField
          labelName="if in college, which one?"
          fieldName="college"
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      </div>
      <TextField
        labelName="did anyone refer you?"
        fieldName="referrals"
        formData={formData}
        onChange={handleChange}
        errors={errors}
      />
    </div>
  );
});
BasicInfoSection.displayName = "BasicInfoSection";

const LinksSection = memo(() => {
  const { formData, handleChange } = useForm();

  return (
    <>
      <SectionDivider section="links" />
      <div className="space-y-4">
        {LINK_FIELDS.map((field) => (
          <LinkField
            key={field.fieldName}
            labelName={field.labelName}
            fieldName={field.fieldName}
            formData={formData}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </>
  );
});
LinksSection.displayName = "LinksSection";

const QuestionsSection = memo(() => {
  const { formData, errors, handleChange, handleSubmit, isSubmitting } =
    useForm();

  return (
    <>
      <SectionDivider section="questions" />

      <div className="space-y-4">
        <TextareaField
          labelName="what do you want to build, create, or investigate during your residency?"
          fieldName="interest"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          placeholder="share your ideas and goals..."
        />

        <TextareaField
          labelName="what are 2-3 things you are most proud of?"
          fieldName="accomplishment"
          formData={formData}
          onChange={handleChange}
          errors={errors}
          placeholder="tell us about your achievements..."
        />
      </div>

      <div className="pt-4">
        <ActionButton
          actionText="submit application"
          loadingText="submitting..."
          isDisabled={isSubmitting}
          type="submit"
        />
      </div>
    </>
  );
});
QuestionsSection.displayName = "QuestionsSection";
