import "server-only";

import { getCurrentProfile } from "@/server/auth/current-user";

export async function getAuthenticatedProfile() {
  return getCurrentProfile();
}
