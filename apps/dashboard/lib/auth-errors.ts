const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":
    "El correo electrónico o la contraseña son incorrectos.",
  "Email not confirmed":
    "Debes confirmar tu correo electrónico antes de iniciar sesión.",
  "User already registered":
    "Ya existe una cuenta con este correo electrónico.",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres.",
  "Unable to validate email address: invalid format":
    "El formato del correo electrónico no es válido.",
  "Signup requires a valid password":
    "Introduce una contraseña válida para registrarte.",
  "For security purposes, you can only request this once every 60 seconds":
    "Por seguridad, debes esperar un minuto antes de volver a solicitarlo.",
  "Token has expired or is invalid":
    "El enlace ha expirado o no es válido. Solicita uno nuevo.",
  "New password should be different from the old password":
    "La nueva contraseña debe ser diferente a la anterior.",
};

const TECHNICAL_PATTERNS = [
  /auth[- ]?error/i,
  /backend/i,
  /supabase/i,
  /jwt/i,
  /token/i,
  /internal server/i,
  /network/i,
  /fetch failed/i,
  /500/,
  /401/,
  /403/,
  /404/,
];

function looksTechnical(message: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

export function translateAuthError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Ha ocurrido un error inesperado. Inténtalo de nuevo.";

  if (AUTH_ERROR_MAP[raw]) {
    return AUTH_ERROR_MAP[raw];
  }

  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  if (looksTechnical(raw)) {
    return "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
  }

  return raw;
}
