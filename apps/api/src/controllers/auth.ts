import type { Context } from "hono";
import { z } from "zod";
import { handleControllerError } from "../lib/http-errors.js";
import * as passwordResetService from "../services/password-reset.js";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function postForgotPassword(c: Context) {
  try {
    const body = forgotPasswordSchema.parse(await c.req.json());
    await passwordResetService.requestPasswordReset(body.email);

    return c.json({
      ok: true,
      message:
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    return handleControllerError(c, error, "postForgotPassword");
  }
}
