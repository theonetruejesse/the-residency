import { InviteAdminForm } from "./_components/invite-admin";
import { ApplicantList } from "./_components/list-applicants";
export default function AdminPage() {
  return (
    <div className="w-full mx-auto my-30 flex flex-col items-center">
      <ApplicantList />
      <InviteAdminForm />
    </div>
  );
}
