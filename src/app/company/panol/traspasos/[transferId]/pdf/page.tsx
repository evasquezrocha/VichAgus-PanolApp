import { TransferDetailContent } from "@/components/panol/traspaso-detail-content";
import { TransferPdfActions } from "@/components/panol/traspaso-pdf-actions";
import { getTransferDisplayNumber } from "@/lib/transfer-number";
import { requireCurrentProfile } from "@/server/auth/guards";
import { getPdfLayoutTemplateByKey } from "@/services/pdf-layouts.service";
import { listEmployees } from "@/services/empleados.service";
import { listPanolLocations } from "@/services/ubicaciones.service";
import { getEmployeeTransfer } from "@/services/traspasos.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type TransferPdfPageProps = {
  params: Promise<{ transferId: string }>;
};

export default async function TransferPdfPage({ params }: TransferPdfPageProps) {
  const profile = await requireCurrentProfile();
  const { transferId } = await params;

  const [employees, locations, transfer, layout] = await Promise.all([
    listEmployees(),
    listPanolLocations(),
    getEmployeeTransfer(transferId),
    getPdfLayoutTemplateByKey("transfer-detail"),
  ]);

  if (!transfer) {
    notFound();
  }

  return (
    <div className="print-document min-h-screen bg-white text-foreground print:min-h-0">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-line pb-4 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Vista imprimible
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Traspaso {getTransferDisplayNumber(transfer)} listo para PDF
            </h1>
            <p className="mt-1 text-sm text-muted">
              Layout compacto para guardar o imprimir.
            </p>
          </div>

          <TransferPdfActions />
        </div>

        <TransferDetailContent
          employees={employees}
          locations={locations}
          transfer={transfer}
          layoutImageValues={{ company_logo_url: profile.company_logo_url }}
          layoutConfig={layout?.layout_config ?? null}
          showHeader={false}
          variant="pdf"
        />
      </div>
    </div>
  );
}
