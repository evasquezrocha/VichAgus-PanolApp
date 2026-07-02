import { getFlashMessage } from "@/lib/flash";
import { requireCurrentProfile } from "@/server/auth/guards";
import { getTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import { TdpProfileBuilder } from "@/components/tdp/profile-builder";

export const dynamic = "force-dynamic";

type TdpProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TdpProfilePage({
  searchParams,
}: TdpProfilePageProps) {
  const profile = await requireCurrentProfile();
  const flash = await getFlashMessage(searchParams);
  const config = await getTdpProfileConfig(profile.id);

  return (
    <TdpProfileBuilder
      flash={flash}
      initialConfig={config}
      userName={profile.full_name ?? profile.email}
    />
  );
}
