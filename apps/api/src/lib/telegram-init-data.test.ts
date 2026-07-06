import { describe, expect, test } from "bun:test";
import {
  TelegramInitDataError,
  signTelegramInitData,
  validateTelegramInitData,
} from "./telegram-init-data.js";

const TEST_BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

function buildValidInitData(overrides: Record<string, string> = {}): string {
  const authDate = String(Math.floor(Date.now() / 1000));
  return signTelegramInitData(
    {
      auth_date: authDate,
      user: JSON.stringify({
        id: 42,
        first_name: "Test",
        username: "testuser",
      }),
      ...overrides,
    },
    TEST_BOT_TOKEN,
  );
}

describe("validateTelegramInitData", () => {
  test("accepts valid initData", () => {
    const initData = buildValidInitData();
    const user = validateTelegramInitData(initData, TEST_BOT_TOKEN);

    expect(user.telegramId).toBe(42);
    expect(user.telegramUsername).toBe("testuser");
    expect(user.firstName).toBe("Test");
  });

  test("rejects tampered hash", () => {
    const initData = buildValidInitData();
    const tampered = initData.replace("testuser", "hacker");

    expect(() => validateTelegramInitData(tampered, TEST_BOT_TOKEN)).toThrow(
      TelegramInitDataError,
    );
  });

  test("rejects expired auth_date", () => {
    const expiredDate = String(Math.floor(Date.now() / 1000) - 25 * 60 * 60);
    const initData = buildValidInitData({ auth_date: expiredDate });

    expect(() => validateTelegramInitData(initData, TEST_BOT_TOKEN)).toThrow(
      TelegramInitDataError,
    );
  });

  test("rejects missing hash", () => {
    expect(() =>
      validateTelegramInitData("auth_date=123&user=%7B%7D", TEST_BOT_TOKEN),
    ).toThrow(TelegramInitDataError);
  });
});
