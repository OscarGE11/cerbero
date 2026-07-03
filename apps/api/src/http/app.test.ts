import { describe, expect, test } from "bun:test";
import { createApp } from "../index.js";

describe("HTTP app", () => {
  const app = createApp(null);

  test("GET /health returns ok", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.env).toBe("development");
  });

  test("GET /unknown returns 404", async () => {
    const response = await app.request("/unknown");
    expect(response.status).toBe(404);
  });

  test("GET /movements without auth returns 401", async () => {
    const response = await app.request("/movements");
    expect(response.status).toBe(401);
  });

  test("GET /user-categories without auth returns 401", async () => {
    const response = await app.request("/user-categories?type=expense");
    expect(response.status).toBe(401);
  });
});
