import { PlatformAdminShell } from "@/components/layout/platform-admin-shell";
import { requirePermission } from "@/server/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requirePermission("platform.access");

  return <PlatformAdminShell profile={profile}>{children}</PlatformAdminShell>;
}
