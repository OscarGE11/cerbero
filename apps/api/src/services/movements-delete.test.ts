import { describe, expect, mock, test } from "bun:test";
import { ZodError } from "zod";
import type { HttpError } from "../lib/http-errors.js";

const MOVEMENT_ID = "5794f1ec-f434-46a1-b5ab-a7841910cb2d";
const USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const deleteMovementMock = mock(() => Promise.resolve(true));

mock.module("../repositories/movements.js", () => ({
  deleteMovement: deleteMovementMock,
}));

const { deleteMovement, parseMovementId } = await import("./movements.js");

describe("parseMovementId", () => {
  test("accepts valid uuid", () => {
    expect(parseMovementId(MOVEMENT_ID)).toBe(MOVEMENT_ID);
  });

  test("rejects invalid id", () => {
    expect(() => parseMovementId("not-a-uuid")).toThrow(ZodError);
  });
});

describe("deleteMovement", () => {
  test("deletes an existing movement", async () => {
    deleteMovementMock.mockImplementation(() => Promise.resolve(true));

    await expect(
      deleteMovement({} as never, USER_ID, MOVEMENT_ID),
    ).resolves.toBeUndefined();

    expect(deleteMovementMock).toHaveBeenCalledWith({}, USER_ID, MOVEMENT_ID);
  });

  test("throws 404 when movement is missing", async () => {
    deleteMovementMock.mockImplementation(() => Promise.resolve(false));

    await expect(
      deleteMovement({} as never, USER_ID, MOVEMENT_ID),
    ).rejects.toMatchObject({
      status: 404,
      message: "Movement not found",
    } satisfies Partial<HttpError>);
  });
});
