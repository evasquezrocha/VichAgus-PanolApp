import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicAssetById, listVisibleAssetDocuments } from "@/services/activos.service";

type AssetQrPageProps = {
  params: Promise<{ assetId: string }>;
};

function getDaysUntil(dateString: string | null) {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(`${dateString}T00:00:00`);
  const diffMs = expiration.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default async function AssetQrPage({ params }: AssetQrPageProps) {
  const { assetId } = await params;
  const [asset, documents] = await Promise.all([
    getPublicAssetById(assetId),
    listVisibleAssetDocuments(assetId),
  ]);

  if (!asset) {
    notFound();
  }

  const groupedDocuments = documents.reduce<Record<string, typeof documents>>((groups, document) => {
    const key = document.category.trim() || "Sin categoria";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(document);
    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfd,_#eef4f8_60%,_#e6edf3)] px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-[2rem] border border-line bg-white p-6 shadow-2xl shadow-slate-200/50 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Documentos visibles por QR
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {asset.af} - {asset.tipo} {asset.marca}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {asset.patente} · {asset.modelo}
              </p>
            </div>

            <Link
              href="/"
              className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
            >
              Ir al inicio
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Documentos</p>
              <p className="mt-2 text-2xl font-semibold">{documents.length}</p>
            </div>
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Con vencimiento</p>
              <p className="mt-2 text-2xl font-semibold">
                {documents.filter((document) => document.expiration_date).length}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Alertas activas</p>
              <p className="mt-2 text-2xl font-semibold">
                {
                  documents.filter((document) => {
                    if (!document.expiration_date) {
                      return false;
                    }

                    const days = getDaysUntil(document.expiration_date);
                    return days !== null && days <= document.notice_days;
                  }).length
                }
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {Object.entries(groupedDocuments).length > 0 ? (
              Object.entries(groupedDocuments).map(([category, categoryDocuments]) => (
                <section key={category} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold tracking-tight">{category}</h2>
                    <span className="rounded-full bg-panel px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {categoryDocuments.length} archivos
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryDocuments.map((document) => {
                      const daysUntilExpiration = getDaysUntil(document.expiration_date);

                      return (
                        <article
                          key={document.id}
                          className="overflow-hidden rounded-[1.5rem] border border-line bg-white p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {document.document_type?.name ?? "Documento"}
                              </p>
                              <p className="mt-1 text-sm text-muted">{document.category}</p>
                            </div>

                            <span
                              className={[
                                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                document.visible_qr
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-neutral-200 text-neutral-700",
                              ].join(" ")}
                            >
                              QR
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            {document.expiration_date ? (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                                Vence {document.expiration_date}
                              </span>
                            ) : (
                              <span className="rounded-full bg-panel px-3 py-1 text-muted">
                                Sin vencimiento
                              </span>
                            )}
                            {daysUntilExpiration !== null ? (
                              <span
                                className={[
                                  "rounded-full px-3 py-1",
                                  daysUntilExpiration < 0
                                    ? "bg-red-100 text-red-700"
                                    : daysUntilExpiration <= document.notice_days
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700",
                                ].join(" ")}
                              >
                                {daysUntilExpiration < 0
                                  ? `Vencido hace ${Math.abs(daysUntilExpiration)} dias`
                                  : daysUntilExpiration === 0
                                    ? "Vence hoy"
                                    : daysUntilExpiration === 1
                                      ? "Vence manana"
                                      : `Vence en ${daysUntilExpiration} dias`}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <a
                              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold transition hover:bg-panel"
                              href={document.file_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Abrir
                            </a>
                            <a
                              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold transition hover:bg-panel"
                              download={document.file_name}
                              href={document.file_url}
                            >
                              Descargar
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-line/80 bg-panel/20 p-6 text-sm text-muted">
                No hay documentos visibles por QR para este activo.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
