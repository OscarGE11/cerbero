import { createClient } from "@/lib/supabase/client";

export async function requestPasswordReset(email: string): Promise<string> {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }

  return "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.";
}
