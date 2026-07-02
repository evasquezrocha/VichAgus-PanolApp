import Link from "next/link";

import { getDefaultDashboardPath } from "@/lib/site";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TdpDashboardPage() {
  redirect(getDefaultDashboardPath());
}

