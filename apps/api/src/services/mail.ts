import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export function isMailConfigured(): boolean {
  return getTransporter() !== null;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transport = getTransporter();

  if (!transport) {
    console.warn(
      "[mail] SMTP not configured — email not sent:",
      options.subject,
      "→",
      options.to,
    );
    return;
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
