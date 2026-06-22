import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { TransferDetailContent } from "@/components/panol/traspaso-detail-content";
import { getFlashMessage } from "@/lib/flash";
import { getTransferDisplayNumber } from "@/lib/transfer-number";
import { requireCurrentProfile } from "@/server/auth/guards";
import { listEmployees } from "@/services/empleados.service";
import { listPanolLocations } from "@/services/ubicaciones.service";
import { getEmployeeTransfer } from "@/services/traspasos.service";
import Link from "next/link";
import { notFound } from "next/navigation";

type TransferDetailPageProps = {
  params: Promise<{ transferId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransferDetailPage({
  params,
  searchParams,
}: TransferDetailPageProps) {
  const profile = await requireCurrentProfile();
  const { transferId } = await params;
  const flash = await getFlashMessage(searchParams);
  const [employees, locations, transfer] = await Promise.all([
    listEmployees(),
    listPanolLocations(),
    getEmployeeTransfer(transferId),
  ]);

  if (!transfer) {
    notFound();
  }

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Traspasos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Detalle de traspaso {getTransferDisplayNumber(transfer)}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/company/panol/traspasos/${transfer.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Generar PDF
            </Link>
            <Link
              href="/company/panol/traspasos?tab=historial"
              className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
            >
              Volver al historial
            </Link>
          </div>
        </div>

        <TransferDetailContent
          employees={employees}
          locations={locations}
          transfer={transfer}
          showHeader={false}
        />
      </section>
    </CompanyShell>
  );
}
