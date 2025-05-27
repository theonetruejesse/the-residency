import { fetchQuery } from "convex/nextjs";
import { api } from "@residency/api";
import { SessionRouter } from "./_components/session-router";
import { redirect } from "next/navigation";
import { RESIDENCY_URL } from "@/lib/constants";
import { PreloadProvider } from "./_components/queries/preload-provider";

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ userId: string }>;
// }) {
//   const { userId } = await params;
//   const validatedUserId = await fetchQuery(api.user.application.userIdFromStr, {
//     userIdString: userId,
//   });
//   if (!validatedUserId) redirect(RESIDENCY_URL);

//   return (
//     <PreloadProvider userId={validatedUserId}>
//       <SessionRouter />
//     </PreloadProvider>
//   );
// }

export default function InterviewPage() {
  return <div>InterviewPage</div>;
}
