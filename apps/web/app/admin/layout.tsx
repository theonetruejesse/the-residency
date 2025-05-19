"use client";

import { TopNav } from "@/components/topnav";
import { Authenticated, AuthLoading } from "convex/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div>
      <Authenticated>
        <TopNav />
        {children}
      </Authenticated>
      <AuthLoading>
        <p>loading...</p>
      </AuthLoading>
    </div>
  );
}
