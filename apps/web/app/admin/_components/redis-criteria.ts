"use server";

import { redis } from "@/lib/helpers";
import type { Doc } from "@residency/api";

export type Criteria = Doc<"grades">["criteria"];
export type CriteriaWeights = Record<Criteria, number>;

export const getCriterias = async (): Promise<CriteriaWeights> => {
  const [mission, intelligence, vision, traction, determination] =
    await Promise.all([
      getOrCreateCriteria("mission"),
      getOrCreateCriteria("intelligence"),
      getOrCreateCriteria("vision"),
      getOrCreateCriteria("traction"),
      getOrCreateCriteria("determination"),
    ]);
  return { mission, intelligence, vision, traction, determination };
};

export const saveCriterias = async (criterias: CriteriaWeights) => {
  const promises = Object.entries(criterias).map(([criteria, weight]) =>
    saveCriteria(criteria as Criteria, weight)
  );
  await Promise.all(promises);
};

const keyHeader = "SUMMER_2025";
const keyName = (criteria: Criteria) => `${keyHeader}-${criteria}`;
const DEFAULT_WEIGHT = 20;

const getOrCreateCriteria = async (criteria: Criteria): Promise<number> => {
  const key = keyName(criteria);
  const exists = await redis.exists(key);

  if (!exists) {
    await redis.set(key, DEFAULT_WEIGHT);
    return DEFAULT_WEIGHT;
  }

  const weight = await redis.get(key);
  return weight as number;
};

const saveCriteria = async (
  criteria: Criteria,
  weight: number
): Promise<boolean> => {
  try {
    await redis.set(keyName(criteria), weight);
    return true;
  } catch (error) {
    console.error("Error saving criteria:", error);
    return false;
  }
};
