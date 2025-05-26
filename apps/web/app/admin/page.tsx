import { InviteAdminButton } from "./_components/invite-admin";
import { ListApplicants } from "./_components/applicants";

export default function AdminPage() {
  return (
    <div className="w-full mx-auto my-20 flex flex-col items-start px-4 md:px-8 lg:px-16 space-y-8">
      <ListApplicants />
      <InviteAdminButton />
    </div>
  );
}
