"use client";

import { useState, memo } from "react";
import { FormProvider, useForm } from "./form-provider";
import { BasicInfoSection, FormSectionController } from "./form-sections";
import { SectionProvider } from "./section-provider";
import { IntakeData, submitIntake } from "../_store/redis-intake";

interface ResidencyFormProps {
  intakeId: string;
  initialData: IntakeData;
}
export const ResidencyForm = memo(
  ({ intakeId, initialData }: ResidencyFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(initialData.isSubmitted);

    return (
      <>
        {!isSubmitted ? (
          <FormProvider intakeId={intakeId} initialData={initialData}>
            <SectionProvider>
              <FormContent
                setIsSubmitted={setIsSubmitted}
                intakeId={intakeId}
              />
            </SectionProvider>
          </FormProvider>
        ) : (
          <Submission />
        )}
      </>
    );
  }
);
ResidencyForm.displayName = "ResidencyForm";

interface FormContentProps {
  setIsSubmitted: (isSubmitted: boolean) => void;
  intakeId: string;
}
const FormContent = memo(({ setIsSubmitted, intakeId }: FormContentProps) => {
  const { handleSubmit } = useForm();

  return (
    <div className="w-full max-w-4xl mx-auto my-30">
      <form
        onSubmit={async (e) => {
          const isSuccess = await handleSubmit(e);
          if (isSuccess) {
            setIsSubmitted(true);
            await submitIntake(intakeId);
          }
        }}
        className="p-8 space-y-6 rounded-lg shadow-md bg-white/80 backdrop-blur-sm mx-2"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 font-mono">
            the residency application
          </h2>
        </div>
        <BasicInfoSection />
        <FormSectionController />
      </form>
    </div>
  );
});
FormContent.displayName = "FormContent";

const Submission = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center glass h-[280px] flex flex-col px-16 items-center justify-center">
        <h1 className="text-5xl mb-4 font-mono font-medium">
          thank you for your application!
        </h1>
        <p className="text-gray-600 text-xl">
          we will review your application and get back to you soon.
        </p>
      </div>
    </div>
  );
});
Submission.displayName = "Submission";
