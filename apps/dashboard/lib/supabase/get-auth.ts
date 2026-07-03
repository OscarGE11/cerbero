import type { Session, User } from "@supabase/supabase-js";
import { cache } from "react";
import { createClient } from "./server";

/** Single server round-trip for layout auth (user + session for client hydration). */
export const getAuth = cache(
  async (): Promise<{
    user: User | null;
    session: Session | null;
  }> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, session: null };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return { user, session };
  },
);
