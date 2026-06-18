export const ROLES = ["super_admin", "company_admin", "company_user"] as const;

export type AppRole = (typeof ROLES)[number];
