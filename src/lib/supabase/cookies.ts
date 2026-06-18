import { getAuthCookieDomain } from "@/lib/tenant";

type SupabaseCookieOptions = {
  domain?: string;
  [key: string]: unknown;
};

export function withSharedSupabaseCookieDomain(options: SupabaseCookieOptions) {
  const domain = getAuthCookieDomain();

  if (!domain) {
    return {
      ...options,
      path: "/",
    };
  }

  return {
    ...options,
    domain,
    path: "/",
  };
}
