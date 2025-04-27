"use client";

import { Button } from "@residency/ui/components/button";
import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@residency/ui/components/card";
import { cn } from "@residency/ui/lib/utils";
import { useConvo } from "./convo-hook";
import { Doc } from "@residency/api";
import { BackgroundWave } from "@/app/[userId]/_components/assets/wave-background";
import { Chalice } from "@/app/[userId]/_components/assets/chalice";
import { ChaliceCard } from "./chalice-card";
export interface InterviewProps {
  session: Doc<"sessions">;
  applicant: { user: Doc<"users">; mission: Doc<"missions"> };
}
export function Interview(props: InterviewProps) {
  const { status, isSpeaking, startConversation, stopConversation } = useConvo({
    ...props,
  });

  return <ChaliceCard />;
  // {
  //   /* <div className={"flex justify-center items-center gap-x-4"}>
  //       <Card className={"rounded-3xl"}>
  //         <CardContent>
  //           <CardHeader>
  //             <CardTitle className={"text-center"}>
  //               {status === "connected"
  //                 ? isSpeaking
  //                   ? `Agent is speaking`
  //                   : "Agent is listening"
  //                 : "Disconnected"}
  //             </CardTitle>
  //           </CardHeader>
  //           <div className={"flex flex-col gap-y-4 text-center"}>
  //             <div
  //               className={cn(
  //                 "orb my-16 mx-12",
  //                 status === "connected" && isSpeaking
  //                   ? "orb-active animate-orb"
  //                   : status === "connected"
  //                     ? "animate-orb-slow orb-inactive"
  //                     : "orb-inactive"
  //               )}
  //             ></div>

  //             <Button
  //               variant={"outline"}
  //               className={"rounded-full"}
  //               size={"lg"}
  //               disabled={status === "connected"}
  //               onClick={startConversation}
  //             >
  //               Start conversation
  //             </Button>
  //             <Button
  //               variant={"outline"}
  //               className={"rounded-full"}
  //               size={"lg"}
  //               disabled={status !== "connected"}
  //               onClick={stopConversation}
  //             >
  //               End conversation
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div> */
  // }
}
