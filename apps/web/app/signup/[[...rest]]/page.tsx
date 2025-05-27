import { SignUp } from "@clerk/nextjs";

import { APP_URL } from "@/lib/constants";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SignupPage({ searchParams }: PageProps) {
  const redirectRoute = (await searchParams).r as string | undefined;

  let redirectUrl: string | null = null;
  if (redirectRoute) {
    redirectUrl = new URL(redirectRoute, APP_URL).toString();
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp forceRedirectUrl={redirectUrl} />
    </div>
  );
}
