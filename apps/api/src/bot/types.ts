import type { Scenes } from "telegraf";
import type { LinkedTelegramUser } from "../repositories/telegram.js";
import type { MovementType } from "../types/index.js";

export interface MovementDraft {
  type?: MovementType;
  categoryId?: string;
  categoryName?: string;
  customCategory?: string;
  title?: string;
  amount?: number;
  comment?: string;
}

export interface SessionData extends Scenes.WizardSessionData {
  movementDraft?: MovementDraft;
}

export interface BotState {
  linkedUser?: LinkedTelegramUser | null;
}

export type BotContext = Scenes.WizardContext<SessionData> & {
  state: BotState;
};

export type BotContextWithState = BotContext;
