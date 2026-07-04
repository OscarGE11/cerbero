import { env } from "../config/env.js";
import { createAdminSupabase } from "../config/supabase.js";
import { HttpError } from "../lib/http-errors.js";
import { isMailConfigured, sendMail } from "./mail.js";
import {
  buildPasswordResetEmailHtml,
  buildResetPasswordUrl,
} from "./password-reset-email.js";

export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = createAdminSupabase();
  const redirectTo = `${env.DASHBOARD_URL.replace(/\/$/, "")}/reset-password`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    if (error.message.toLowerCase().includes("user not found")) {
      return;
    }
    throw new HttpError(500, "No se pudo procesar la solicitud");
  }

  const token = data.properties?.hashed_token;
  if (!token) {
    throw new HttpError(500, "No se pudo generar el enlace de recuperación");
  }

  const resetUrl = buildResetPasswordUrl(token);

  if (!isMailConfigured()) {
    console.info("[password-reset] Dev fallback — reset URL:", resetUrl);
    return;
  }

  await sendMail({
    to: email,
    subject: "Restablece tu contraseña — Cerbero",
    html: buildPasswordResetEmailHtml(resetUrl),
  });
}
