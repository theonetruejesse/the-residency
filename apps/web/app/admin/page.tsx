import { InviteAdminButton } from "./_components/invite-admin";
import { ListApplicants } from "./_components/applicants";
import { ApplicantQueryProvider } from "./_components/applicants/query-provider";
import { getCriterias } from "./_components/redis-criteria";

export default async function AdminPage() {
  const criterias = await getCriterias();
  return (
    <ApplicantQueryProvider criterias={criterias}>
      <div className="w-full mx-auto my-20 flex flex-col items-start px-4 md:px-8 lg:px-16 space-y-8">
        <ListApplicants />
        <InviteAdminButton />
      </div>
    </ApplicantQueryProvider>
  );
}
