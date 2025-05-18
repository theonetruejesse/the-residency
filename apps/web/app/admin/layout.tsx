import { TopNav } from "@/components/topnav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <TopNav />
      {children}
    </div>
  );
}
