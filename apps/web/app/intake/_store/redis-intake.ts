"use server";

import { FormData } from "@/app/intake/_components/form-types";
import { generateId, redis } from "@/lib/helpers";

const INTAKE_TTL = 60 * 60 * 24;

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

export type IntakeData = {
  formData: FormData;
  lastUpdated: string;
  isSubmitted: boolean;
};

export const getOrCreateIntake = async (intakeId?: string): Promise<string> => {
  if (!intakeId) {
    const newIntakeId = await createIntake();
    if (!newIntakeId) {
      throw new Error("Failed to create intake");
    }
    return newIntakeId;
  }

  const exists = await redis.exists(`intake:${intakeId}`);
  if (!exists) {
    const newIntakeId = await createIntake();
    if (!newIntakeId) {
      throw new Error("Failed to create intake");
    }
    return newIntakeId;
  }

  return intakeId;
};

const createIntake = async (): Promise<string | null> => {
  try {
    const intakeData: IntakeData = {
      formData: INITIAL_FORM_DATA,
      lastUpdated: new Date().toISOString(),
      isSubmitted: false,
    };

    const newIntakeId = generateId();
    await redis.set(`intake:${newIntakeId}`, JSON.stringify(intakeData), {
      ex: INTAKE_TTL,
    });

    return newIntakeId;
  } catch (error) {
    console.error("Error saving intake data:", error);
    return null;
  }
};

export const getIntakeData = async (
  intakeId: string
): Promise<IntakeData | null> => {
  try {
    const data = await redis.get(`intake:${intakeId}`);
    return data as IntakeData | null;
  } catch (error) {
    console.error("Error retrieving intake data:", error);
    return null;
  }
};

export const submitIntake = async (intakeId: string): Promise<boolean> => {
  try {
    // Get the current intake data
    const intakeData = await getIntakeData(intakeId);
    if (!intakeData) {
      console.error("Cannot submit: Intake data not found");
      return false;
    }

    // Mark as submitted
    intakeData.isSubmitted = true;
    intakeData.lastUpdated = new Date().toISOString();

    // Save back to Redis
    await redis.set(`intake:${intakeId}`, intakeData, {
      ex: INTAKE_TTL,
    });

    return true;
  } catch (error) {
    console.error("Error setting intake submitted:", error);
    return false;
  }
};

// assume that isSubmitted is false when the form is loaded
export const saveIntakeData = async (
  intakeId: string,
  formData: FormData
): Promise<boolean> => {
  try {
    const intakeData: IntakeData = {
      formData,
      lastUpdated: new Date().toISOString(),
      isSubmitted: false,
    };

    await redis.set(`intake:${intakeId}`, JSON.stringify(intakeData), {
      ex: INTAKE_TTL,
    });

    return true;
  } catch (error) {
    console.error("Error saving intake data:", error);
    return false;
  }
};
