import type { Context } from "telegraf";
import type { LinkedTelegramUser } from "../repositories/telegram.js";

export interface BotState {
  linkedUser?: LinkedTelegramUser | null;
}

export type BotContext = Context & {
  state: BotState;
};

export type BotContextWithState = BotContext;
