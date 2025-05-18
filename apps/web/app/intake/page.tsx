import { redirect } from "next/navigation";
import { ResidencyForm } from "./_components/intake-form";
import { getIntakeData, getOrCreateIntake } from "./_store/redis-intake";

// when the user refreshes the page, the ?s=intakeId saves form data
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function Page({ searchParams }: PageProps) {
  const existingIntakeId = (await searchParams).s as string | undefined;
  const intakeId = await getOrCreateIntake(existingIntakeId);

  if (!existingIntakeId || existingIntakeId !== intakeId) {
    redirect(`/intake?s=${intakeId}`);
  }

  const intakeData = await getIntakeData(intakeId);

  if (!intakeData) {
    throw new Error("Intake data not found");
  }

  return <ResidencyForm intakeId={intakeId} initialData={intakeData} />;
}
