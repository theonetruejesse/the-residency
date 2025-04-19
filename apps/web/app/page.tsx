import { RESIDENCY_URL } from "@/lib/constants";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(RESIDENCY_URL);
}
