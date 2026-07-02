import type { Context } from "hono";
import { env } from "../config/env.js";
import { createAdminSupabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import * as linkSessionsService from "../services/link-sessions.js";
import type { AppVariables } from "../types/index.js";

function renderLinkPage(token: string): string {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cerbero — Vincular Telegram</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; }
    form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    input, button { padding: 0.6rem; font-size: 1rem; }
    button { cursor: pointer; background: #111; color: #fff; border: none; border-radius: 6px; }
    button.secondary { background: #eee; color: #111; }
    .error { color: #b00020; }
    .success { color: #0a0; background: #f0fff0; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
    .code { font-size: 2rem; font-weight: bold; letter-spacing: 0.3rem; text-align: center; margin: 1rem 0; }
    .hidden { display: none; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tabs button { flex: 1; }
  </style>
</head>
<body>
  <h1>Vincular Telegram con Cerbero</h1>
  <p id="intro">Crea tu cuenta o inicia sesión para obtener el código OTP.</p>
  <div id="auth-section">
    <div class="tabs">
      <button type="button" id="tab-login" class="secondary">Iniciar sesión</button>
      <button type="button" id="tab-signup">Registrarse</button>
    </div>
    <form id="login-form">
      <input type="email" id="login-email" placeholder="Email" required />
      <input type="password" id="login-password" placeholder="Contraseña" required />
      <button type="submit">Iniciar sesión</button>
    </form>
    <form id="signup-form" class="hidden">
      <input type="email" id="signup-email" placeholder="Email" required />
      <input type="password" id="signup-password" placeholder="Contraseña (mín. 6)" required minlength="6" />
      <button type="submit">Crear cuenta</button>
    </form>
    <p id="error" class="error hidden"></p>
  </div>
  <div id="success-section" class="hidden">
    <div class="success">
      <p>✅ Cuenta lista. Copia este código y envíalo al bot de Telegram:</p>
      <div class="code" id="otp-code"></div>
      <p><code>/link <span id="otp-inline"></span></code></p>
      <p><small>El código expira en 30 minutos.</small></p>
    </div>
  </div>
  <script type="module">
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    const token = ${JSON.stringify(token)};
    const supabase = createClient(${JSON.stringify(supabaseUrl)}, ${JSON.stringify(supabaseAnonKey)});

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const errorEl = document.getElementById("error");
    const authSection = document.getElementById("auth-section");
    const successSection = document.getElementById("success-section");

    document.getElementById("tab-login").onclick = () => {
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    };
    document.getElementById("tab-signup").onclick = () => {
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    };

    async function completeLink(accessToken) {
      const res = await fetch("/link/sessions/complete", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar código");
      return data;
    }

    async function onAuthSuccess(session) {
      const { code } = await completeLink(session.access_token);
      authSection.classList.add("hidden");
      document.getElementById("intro").classList.add("hidden");
      successSection.classList.remove("hidden");
      document.getElementById("otp-code").textContent = code;
      document.getElementById("otp-inline").textContent = code;
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.remove("hidden");
    }

    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      errorEl.classList.add("hidden");
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return showError(error.message);
      await onAuthSuccess(data.session);
    };

    signupForm.onsubmit = async (e) => {
      e.preventDefault();
      errorEl.classList.add("hidden");
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return showError(error.message);
      if (!data.session) return showError("Revisa tu email para confirmar la cuenta, o desactiva confirmación en Supabase (dev).");
      await onAuthSuccess(data.session);
    };
  </script>
</body>
</html>`;
}

export async function getLinkSessionStatus(c: Context) {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ error: "token is required" }, 400);
  }

  const supabase = createAdminSupabase();
  const session = await linkSessionsService.getLinkSessionByToken(
    supabase,
    token,
  );

  if (!session) {
    return c.json({ status: "invalid" }, 410);
  }

  if (session.completed_at && session.code) {
    return c.json({ status: "completed", code: session.code });
  }

  return c.json({ status: "pending" });
}

export async function getLinkPage(c: Context) {
  const token = c.req.query("token");
  if (!token) {
    return c.text("Missing token. Start from Telegram with /login", 400);
  }

  const supabase = createAdminSupabase();
  const session = await linkSessionsService.getLinkSessionByToken(
    supabase,
    token,
  );

  if (!session) {
    return c.text(
      "Enlace inválido o expirado. Usa /login de nuevo en Telegram.",
      410,
    );
  }

  if (session.completed_at && session.code) {
    return c.html(
      `<html><body style="font-family:system-ui;max-width:420px;margin:2rem auto;padding:1rem">
        <h1>Código OTP</h1>
        <p>Envía esto al bot: <code>/link ${session.code}</code></p>
      </body></html>`,
    );
  }

  return c.html(renderLinkPage(token));
}

type CompleteContext = Context<{ Variables: AppVariables }>;

export async function postLinkSessionComplete(c: CompleteContext) {
  try {
    const body = await c.req.json<{ token?: string }>();
    if (!body.token) {
      return c.json({ error: "token is required" }, 400);
    }

    const admin = createAdminSupabase();
    const result = await linkSessionsService.completeLoginSession(admin, {
      token: body.token,
      userId: c.get("userId"),
    });

    return c.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to complete link session";
    const status =
      message === "INVALID_OR_EXPIRED_SESSION"
        ? 410
        : message === "SESSION_ALREADY_COMPLETED"
          ? 409
          : 500;
    return c.json({ error: message }, status);
  }
}

export { authMiddleware as linkCompleteAuth };
