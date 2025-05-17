"use client";

import { useState } from "react";
import { FormProvider, useForm } from "./_components/form-provider";
import { SectionProvider } from "./_components/section-provider";
import { FormSectionController } from "./_components/intake-form";
import { BasicInfoSection } from "./_components/intake-form";

export default function Page() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <>
      {!isSubmitted ? (
        <ResidencyForm setIsSubmitted={setIsSubmitted} />
      ) : (
        <Submission />
      )}
    </>
  );
}

interface ResidencyFormProps {
  setIsSubmitted: (isSubmitted: boolean) => void;
}

const ResidencyForm = ({ setIsSubmitted }: ResidencyFormProps) => {
  return (
    <FormProvider>
      <SectionProvider>
        <FormContent setIsSubmitted={setIsSubmitted} />
      </SectionProvider>
    </FormProvider>
  );
};

const FormContent = ({ setIsSubmitted }: ResidencyFormProps) => {
  const { handleSubmit } = useForm();

  return (
    <div className="w-full max-w-4xl mx-auto my-30">
      <form
        onSubmit={async (e) => {
          const isSuccess = await handleSubmit(e);
          if (isSuccess) setIsSubmitted(true);
        }}
        className="p-8 space-y-6 rounded-lg shadow-md bg-white/80 backdrop-blur-sm mx-2"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            the residency application
          </h2>
        </div>
        <BasicInfoSection />
        <FormSectionController />
      </form>
    </div>
  );
};

const Submission = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center glass h-[280px] flex flex-col px-16 items-center justify-center">
        <h1 className="text-5xl font-bold mb-4">
          Thank you for your application!
        </h1>
        <p className="text-gray-600 text-xl">
          We will review your application and get back to you soon.
        </p>
      </div>
    </div>
  );
};
