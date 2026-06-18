"use client";

import { updateCompanyAction } from "@/actions/companies.actions";
import type { Company } from "@/types/company";
import { useState } from "react";

type CompanyAdminCardProps = {
  company: Company;
  publicUrl: string;
  resolutionLabel: string;
};

export function CompanyAdminCard({
  company,
  publicUrl,
  resolutionLabel,
}: CompanyAdminCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const formId = `company-update-${company.id}`;

  return (
    <>
      <article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-white/70 p-5 shadow-lg shadow-[#2b3a44]/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {resolutionLabel}
              </span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                  company.is_active
                    ? "bg-[#52D6A4]/15 text-[#1d4335]"
                    : "bg-[#c86f5d]/15 text-[#7b3428]",
                ].join(" ")}
              >
                {company.is_active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {company.name}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Slug canónico: <span className="font-mono text-foreground">{company.slug}</span>
            </p>
          </div>

          <button
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-soft"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Editar
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-accent-soft/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              URL final
            </p>
            <a
              className="mt-2 block break-all font-mono text-sm font-semibold text-accent underline decoration-accent/25 underline-offset-4 transition hover:text-accent-strong"
              href={publicUrl}
              rel="noreferrer"
              target="_blank"
            >
              {publicUrl}
            </a>
            <p className="mt-2 text-xs leading-5 text-muted">
              Este es el enlace que verá el cliente cuando entre a su tenant.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Resolución
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Subdominio
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              La app responde en el subdominio generado desde el slug.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            href={publicUrl}
            rel="noreferrer"
            target="_blank"
          >
            Probar dominio
          </a>
          <button
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-soft"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Editar datos
          </button>
        </div>
      </article>

      {isEditing ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c2830]/55 p-4"
          role="dialog"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-line bg-[#fffdf8] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                  Editar empresa
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  {company.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Cambia nombre, slug, dominio o estado. La URL final se actualiza
                  al guardar.
                </p>
              </div>
              <button
                aria-label="Cerrar modal"
                className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent-soft"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cerrar
              </button>
            </div>

            <form action={updateCompanyAction} className="mt-6 space-y-5">
              <input name="id" type="hidden" value={company.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Nombre</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                    name="name"
                    defaultValue={company.name}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Slug</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 font-mono outline-none ring-accent/25 transition focus:ring-4"
                    name="slug"
                    defaultValue={company.slug}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4">
                <label className="flex items-end gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                  <input
                    className="mb-1 h-4 w-4 accent-[#2b3a44]"
                    name="is_active"
                    type="checkbox"
                    value="true"
                    defaultChecked={company.is_active}
                  />
                  <span className="text-sm font-medium">Activa</span>
                </label>
              </div>

              <div className="rounded-2xl border border-line bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  URL final
                </p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-accent">
                  {publicUrl}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Si cambias el slug o el dominio, esta será la URL canónica del
                  tenant.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
                <button
                  className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-accent transition hover:bg-accent-soft"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
