import { InviteAdminForm } from "./_components/invite-admin";
import { ApplicantList } from "./_components/list-applicants";
export default function AdminPage() {
  return (
    <div className="w-full mx-auto my-30 flex flex-col items-start px-4 md:px-8 lg:px-16 space-y-8">
      <ApplicantList />
      <InviteAdminForm />
    </div>
  );
}
