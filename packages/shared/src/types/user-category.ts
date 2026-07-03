import type { MovementType } from "./movement";

export interface UserCategory {
  id: string;
  name: string;
  type: MovementType;
  useCount: number;
  lastUsedAt: string;
  createdAt: string;
}
