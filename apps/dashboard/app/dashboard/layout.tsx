import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardProviders } from "@/components/providers";
import { getAuth } from "@/lib/supabase/get-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await getAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProviders initialSession={session}>
      <DashboardShell userEmail={user.email}>{children}</DashboardShell>
    </DashboardProviders>
  );
}
