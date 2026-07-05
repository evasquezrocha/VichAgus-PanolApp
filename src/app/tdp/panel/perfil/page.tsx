import { getFlashMessage } from "@/lib/flash";
import { requireCurrentProfile } from "@/server/auth/guards";
import { getTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import { listTdpAuthUsers } from "@/server/dal/tdp-users.dal";
import { TdpProfileBuilder } from "@/components/tdp/profile-builder";
import { DEFAULT_TDP_PROFILE_CONFIG } from "@/types/tdp-profile";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

type TdpProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TdpProfilePage({
  searchParams,
}: TdpProfilePageProps) {
  const profile = await requireCurrentProfile();
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const targetUserId = typeof params.user === "string" ? params.user : null;
  const isCreateMode = params.create === "1";

  const targetUser =
    targetUserId && profile.is_tdp_admin
      ? (await listTdpAuthUsers()).find((user) => user.id === targetUserId) ?? profile
    : profile;
  const config = isCreateMode
    ? {
        ...DEFAULT_TDP_PROFILE_CONFIG,
        profile_code: randomBytes(6).toString("hex"),
      }
    : await getTdpProfileConfig(targetUser.id);
  const returnTo =
    profile.is_tdp_admin && targetUser.id !== profile.id
      ? `/tdp/panel/usuarios?user=${encodeURIComponent(targetUser.id)}`
      : "/tdp/panel/perfil";

  return (
    <TdpProfileBuilder
      flash={flash}
      initialConfig={config}
      returnTo={returnTo}
      targetUserId={targetUser.id}
      userName={targetUser.full_name ?? targetUser.email}
    />
  );
}
