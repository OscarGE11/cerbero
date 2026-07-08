import { Hono } from "hono";
import * as telegramController from "../controllers/telegram.js";
import { requireLinkedTelegramMiddleware } from "../middleware/telegram-auth.js";
import { requireInitDataMiddleware } from "../middleware/telegram-init-data.js";
import type { TelegramAppVariables } from "../types/index.js";

export function createTelegramRoutes() {
  const routes = new Hono<{ Variables: TelegramAppVariables }>();

  routes.get(
    "/me",
    requireInitDataMiddleware,
    telegramController.getTelegramMe,
  );
  routes.post(
    "/link",
    requireInitDataMiddleware,
    telegramController.postTelegramLink,
  );

  routes.use("/movements", requireLinkedTelegramMiddleware);
  routes.get("/movements", telegramController.getTelegramMovements);
  routes.post("/movements", telegramController.postTelegramMovement);
  routes.delete(
    "/movements/:id",
    requireLinkedTelegramMiddleware,
    telegramController.deleteTelegramMovement,
  );

  routes.use("/summary", requireLinkedTelegramMiddleware);
  routes.get("/summary", telegramController.getTelegramSummary);

  routes.use("/categories", requireLinkedTelegramMiddleware);
  routes.get("/categories", telegramController.getTelegramCategories);

  routes.use("/user-categories", requireLinkedTelegramMiddleware);
  routes.get("/user-categories", telegramController.getTelegramUserCategories);

  return routes;
}
