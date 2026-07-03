import { describe, expect, test } from "bun:test";
import {
  formatGuestCommandsHelp,
  formatLinkedCommandsHelp,
  formatRequireLinkMessage,
  formatStartMessage,
} from "./messages.js";

describe("bot messages", () => {
  test("linked start lists all main commands", () => {
    const message = formatStartMessage(true);

    expect(message).toContain("/add");
    expect(message).toContain("/last");
    expect(message).toContain("/month");
    expect(message).toContain("/dashboard");
    expect(message).toContain("/unlink");
    expect(message).toContain("/cancel");
  });

  test("guest start explains onboarding flow", () => {
    const message = formatStartMessage(false);

    expect(message).toContain("/login");
    expect(message).toContain("/link");
    expect(message).toContain("/add");
    expect(message).toContain("/dashboard");
  });

  test("linked commands help is structured", () => {
    expect(formatLinkedCommandsHelp()).toContain("Panel web");
    expect(formatGuestCommandsHelp()).toContain("Primeros pasos");
    expect(formatRequireLinkMessage()).toContain("Primero vincula");
  });
});
