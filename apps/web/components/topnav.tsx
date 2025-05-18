import { SignOutButton } from "@clerk/nextjs";

export const TopNav = () => {
  return (
    <nav className="mb-3 flex w-full items-center justify-between border-b py-4 px-8 text-xl font-medium">
      <div>the residency</div>
      <div>
        <SignOutButton redirectUrl="/">
          <button className="text-muted-foreground">sign out</button>
        </SignOutButton>
      </div>
    </nav>
  );
};
