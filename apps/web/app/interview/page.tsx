import { fetchQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";
import { PreloadProvider } from "./_components/queries/preload-provider";

export default async function Page() {
  return (
    <PreloadProvider userId={validatedUserId}>
      <SessionRouter />
    </PreloadProvider>
  );
}
