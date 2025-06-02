"use client";

import { Button } from "@residency/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@residency/ui/components/popover";
import { Slider } from "@residency/ui/components/slider";
import { useState, useEffect } from "react";

const CRITERIA = [
  "mission",
  "intelligence",
  "vision",
  "traction",
  "determination",
] as const;
const DEFAULT_WEIGHT = 20;

export const HeaderGrade = () => {
  const [weights, setWeights] = useState<Record<string, number>>(
    CRITERIA.reduce(
      (acc, criteria) => ({ ...acc, [criteria]: DEFAULT_WEIGHT }),
      {} as Record<string, number>
    )
  );

  const [originalWeights] = useState<Record<string, number>>(
    CRITERIA.reduce(
      (acc, criteria) => ({ ...acc, [criteria]: DEFAULT_WEIGHT }),
      {} as Record<string, number>
    )
  );

  const [hasChanges, setHasChanges] = useState(false);

  // Popover open state
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const changed = CRITERIA.some(
      (criteria) => weights[criteria] !== originalWeights[criteria]
    );
    setHasChanges(changed);
  }, [weights, originalWeights]);

  const handleSliderChange = (criteria: string, newValue: number[]) => {
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

    const newWeights: Record<string, number> = {
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

  const handleReset = () => {
    setWeights({ ...originalWeights });
  };

  const handleSave = () => {
    console.log("Saving weights:", weights);
    // Here you would typically save to your backend or state management
    setOpen(false); // Close the popover after saving
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
            const weight = weights[criteria] ?? DEFAULT_WEIGHT;
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
          <Button onClick={handleSave} disabled={!hasChanges}>
            save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
