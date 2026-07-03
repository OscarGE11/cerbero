import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MovementsPageContent } from "@/features/movements/components/movements-page";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function MovementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell userEmail={user.email}>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-muted-foreground">
            Cargando movimientos…
          </div>
        }
      >
        <MovementsPageContent />
      </Suspense>
    </DashboardShell>
  );
}
