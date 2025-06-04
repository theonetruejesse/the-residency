import { redirect } from "next/navigation";
import { getOrCreateIntake } from "./intake/_store/redis-intake";

export default async function Page() {
  const intakeId = await getOrCreateIntake();
  redirect(`/intake?s=${intakeId}`);
}
