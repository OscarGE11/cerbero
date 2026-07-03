import { getAuth } from "./get-auth";

/** Dedupes getUser() within the same RSC request (layout + pages). */
export async function getUser() {
  const { user } = await getAuth();
  return user;
}
