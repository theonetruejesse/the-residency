"use client";

import { Button } from "@residency/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@residency/ui/components/popover";
import { Slider } from "@residency/ui/components/slider";
import { useState, useEffect } from "react";
import { useCriterias } from "./query-hooks";
import type { Criteria, CriteriaWeights } from "../redis-criteria";

export const CriteriasSlider = () => {
  const { criterias, updateCriterias } = useCriterias();
  // Get criteria keys dynamically from the criterias object
  const CRITERIA = Object.keys(criterias) as Criteria[];

  const [weights, setWeights] = useState<CriteriaWeights>(criterias);
  const [originalWeights] = useState<CriteriaWeights>(criterias);
  const [hasChanges, setHasChanges] = useState(false);
  const [open, setOpen] = useState(false);

  // Update local weights when criterias change from the store
  useEffect(() => {
    setWeights(criterias);
  }, [criterias]);

  useEffect(() => {
    const changed = CRITERIA.some(
      (criteria) => weights[criteria] !== originalWeights[criteria]
    );
    setHasChanges(changed);
  }, [weights, originalWeights, CRITERIA]);

  const handleReset = () => {
    setWeights({ ...originalWeights });
  };

  const handleSave = async () => {
    await updateCriterias(weights);
    setOpen(false);
  };

  const handleSliderChange = (criteria: Criteria, newValue: number[]) => {
    const newWeight = newValue[0];
    if (newWeight === undefined) return;

    const oldWeight = weights[criteria];
    if (oldWeight === undefined) return;

    const difference = newWeight - oldWeight;

    // Calculate how much to distribute among other criteria
    const otherCriteria = CRITERIA.filter((c) => c !== criteria);
    const totalOtherWeight = otherCriteria.reduce((sum, c) => {
      const weight = weights[c];
      return weight !== undefined ? sum + weight : sum;
    }, 0);

    if (totalOtherWeight === 0) return; // Prevent division by zero

    const newWeights: CriteriaWeights = {
      ...weights,
      [criteria]: newWeight,
    };

    // Distribute the difference proportionally among other criteria
    otherCriteria.forEach((c) => {
      const currentWeight = weights[c];
      if (currentWeight !== undefined) {
        const proportion = currentWeight / totalOtherWeight;
        const adjustment = difference * proportion;
        newWeights[c] = Math.max(0, Math.min(100, currentWeight - adjustment));
      }
    });

    // Ensure total is exactly 100
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    if (total !== 100) {
      const adjustment = (100 - total) / otherCriteria.length;
      otherCriteria.forEach((c) => {
        const currentWeight = newWeights[c];
        if (currentWeight !== undefined) {
          newWeights[c] = Math.max(
            0,
            Math.min(100, currentWeight + adjustment)
          );
        }
      });
    }

    setWeights(newWeights);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="border border-gray-400 text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          grade
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-sm" align="start">
        <div className="space-y-4">
          {CRITERIA.map((criteria) => {
            const weight = weights[criteria];
            return (
              <div key={criteria} className="flex items-center gap-4">
                <span className="text-sm font-medium min-w-[100px]">
                  {criteria}
                </span>
                <div className="flex-1">
                  <Slider
                    value={[weight]}
                    onValueChange={(value) =>
                      handleSliderChange(criteria, value)
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                  {Math.round(weight)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              reset
            </Button>
          )}
          <SaveButton hasChanges={hasChanges} handleSave={handleSave} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface SaveButtonProps {
  hasChanges: boolean;
  handleSave: () => Promise<void>;
}

const SaveButton = ({ hasChanges, handleSave }: SaveButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    await handleSave();
    setIsSaving(false);
  };
  return (
    <Button
      onClick={async () => handleSaveClick()}
      disabled={!hasChanges || isSaving}
    >
      {isSaving ? "saving..." : "save"}
    </Button>
  );
};
