import { redirect } from "next/navigation";

type TenantCatchAllPageProps = {
  params: Promise<{
    tenantSlug: string;
    path: string[];
  }>;
};

export default async function TenantCatchAllPage({
  params,
}: TenantCatchAllPageProps) {
  const { path } = await params;
  const targetPath = `/${path.join("/")}`;

  redirect(targetPath === "/" ? "/dashboard" : targetPath);
}
