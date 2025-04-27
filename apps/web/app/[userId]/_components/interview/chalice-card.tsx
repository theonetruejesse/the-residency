"use client";

import { useState } from "react";
import { BackgroundWave } from "../assets/wave-background";
import { Chalice } from "../assets/chalice";
import { Card } from "@residency/ui/components/card";
import { Button } from "@residency/ui/components/button";

export const ChaliceCard = () => {
  const [isActivated, setIsActivated] = useState(false);

  const toggleActivation = () => {
    setIsActivated(!isActivated);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-end relative overflow-hidden">
      <BackgroundWave isActivated={isActivated} />

      <div className="relative w-full max-w-xl mx-auto mb-8">
        <Card className="relative w-full h-60 overflow-visible glass">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-[85%] z-30  h-[70vh] w-[110%]">
            <Chalice isActivated={isActivated} />
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-20 px-10">
            <Button
              variant={isActivated ? "secondary" : "outline"}
              className={"rounded-full w-full text-lg p-6"}
              size={"lg"}
              onClick={toggleActivation}
            >
              {isActivated ? "End Interview" : "Start Interview"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
