import { UserButton } from "@clerk/nextjs";

export const TopNav = () => {
  return (
    <nav className="mb-3 flex w-full items-center justify-between border-b py-4 px-8 text-xl font-medium">
      <h1 className="font-mono">the residency</h1>
      <div className="flex items-center">
        <UserButton />
      </div>
    </nav>
  );
};
