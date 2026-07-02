import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-muted-foreground underline"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-medium">Bienvenido a Cerbero</h2>
        <p className="mt-2 text-muted-foreground">
          Tu cuenta web está lista. Las vistas de movimientos e informes
          llegarán en los próximos pasos.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Si aún no has vinculado Telegram, usa <code>/login</code> en el bot,
          regístrate aquí y luego envía <code>/link TU_CODIGO</code>.
        </p>
      </section>
    </main>
  );
}
