import { fetchJwt, getApiUrl } from "./lib/auth.js";

const token = process.env.DEV_JWT ?? (await fetchJwt());
const apiUrl = getApiUrl();

const response = await fetch(`${apiUrl}/link-codes`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const data = (await response.json()) as {
  code?: string;
  expiresAt?: string;
  error?: string;
};

if (!response.ok || !data.code) {
  console.error("Failed to create link code:", data);
  console.error(`Is the API running? Try: bun run dev:api (${apiUrl})`);
  process.exit(1);
}

console.log("");
console.log("Código de vinculación generado:");
console.log(`  ${data.code}`);
console.log(`  Expira: ${data.expiresAt}`);
console.log("");
console.log("En Telegram, envía al bot:");
console.log(`  /link ${data.code}`);
console.log("");
