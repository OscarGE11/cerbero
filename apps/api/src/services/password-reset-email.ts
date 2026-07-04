import { env } from "../config/env.js";

export function buildPasswordResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contraseña — Cerbero</title>
</head>
<body style="margin:0;padding:0;background-color:#070b14;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#070b14;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#121826;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;border-radius:16px;background-color:rgba(123,97,255,0.2);line-height:48px;font-size:20px;font-weight:700;color:#7b61ff;">C</div>
              <h1 style="margin:16px 0 8px;font-size:22px;font-weight:600;color:#f4f6fb;">Restablecer contraseña</h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#8b95a8;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Cerbero.
                Haz clic en el botón para elegir una nueva contraseña.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background-color:#7b61ff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:12px;box-shadow:0 8px 24px rgba(123,97,255,0.35);">
                Restablecer contraseña
              </a>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8b95a8;">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                El enlace expirará en breve.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#8b95a8;">Cerbero — Tu panel financiero</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildResetPasswordUrl(token: string): string {
  const base = env.DASHBOARD_URL.replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}
