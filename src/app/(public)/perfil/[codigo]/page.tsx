import { PublicWidgetAction } from "@/components/tdp/public-widget-action";
import { getTdpPublicProfileBaseUrl } from "@/lib/site";
import { getTdpProfileByPublicCode } from "@/server/dal/tdp-profile-configs.dal";
import type { TdpWidgetId } from "@/types/tdp-profile";
import { notFound } from "next/navigation";

type TdpPublicProfilePageProps = {
  params: Promise<{ codigo: string }>;
};

function buildPreviewBackground(
  background1: string,
  background2: string,
  useSecondBackground: boolean,
) {
  return useSecondBackground
    ? `linear-gradient(180deg, ${background1} 0%, ${background2} 100%)`
    : background1;
}

function normalizePublicUrl(url: string) {
  const value = url.trim();
  if (!value) {
    return "#";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getWhatsappUrl(countryCode: string, number: string, message: string) {
  const cleaned = `${countryCode}${number}`.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message || "Hola! Te escribo desde tu tarjeta digital");
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ""}`;
}

function getTelUrl(countryCode: string, number: string) {
  return `tel:${`${countryCode}${number}`.replace(/\s+/g, "")}`;
}

function getMailTo(email: string, subject: string) {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${params}`;
}

function getStorageProxyUrl(storagePath: string) {
  return `/api/tdp/storage/${storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function WidgetGlyph({ widgetId }: { widgetId: TdpWidgetId }) {
  const iconProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (widgetId) {
    case "photo":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <rect x="4" y="5" width="16" height="14" rx="3" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M20 11.7A8 8 0 1 1 8.3 5l1.2-.2a8 8 0 0 1 10.5 7.7Z" />
          <path d="M9.2 8.2c.2-.4.7-.7 1.1-.7h.4c.4 0 .8.2 1 .6l.6 1.3c.2.5.1 1-.2 1.4l-.7.8c-.2.2-.2.6 0 .9.7 1.4 1.9 2.6 3.3 3.3.3.2.7.2.9 0l.8-.7c.4-.4.9-.4 1.4-.2l1.4.6c.4.2.6.6.6 1v.5c0 .5-.2.9-.7 1.1-.7.3-1.5.4-2.2.2-3.8-1-7.1-4.3-8.1-8.1-.2-.7-.1-1.5.2-2.2Z" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M7.4 4.5h2.8l1.4 4-1.8 1.8a13 13 0 0 0 3.9 3.9l1.8-1.8 4 1.4v2.8c0 .9-.7 1.6-1.6 1.6C9.9 18.2 5.8 14.1 5.8 8.6c0-.9.7-1.6 1.6-1.6Z" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
          <path d="m4.8 7.2 7.2 5.8 7.2-5.8" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.4" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          <path d="M8.2 10v6" />
          <path d="M8.2 8.2v.2" />
          <path d="M11.2 16v-3.5c0-1.3.8-2.2 2-2.2 1.1 0 1.8.8 1.8 2.2V16" />
        </svg>
      );
    case "website":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2.3 2.4 3.5 5 3.5 8s-1.2 5.6-3.5 8c-2.3-2.4-3.5-5-3.5-8S9.7 6.4 12 4Z" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.1" />
        </svg>
      );
    case "transfer":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <rect x="3.5" y="6" width="17" height="11.5" rx="2.2" />
          <path d="M6 10h12" />
        </svg>
      );
    case "pdf":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M7.2 3.5h7.6l4 4V20.5H7.2Z" />
          <path d="M14.8 3.5v4h4" />
          <path d="M9.2 14h5.6" />
        </svg>
      );
    case "custom":
      return (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M10 14a4 4 0 0 1 0-5.7l1.2-1.2a4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7l-.8.8" />
          <path d="M14 10a4 4 0 0 1 0 5.7l-1.2 1.2a4 4 0 0 1-5.7 0 4 4 0 0 1 0-5.7l.8-.8" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function TdpPublicProfilePage({
  params,
}: TdpPublicProfilePageProps) {
  const { codigo } = await params;
  const profile = await getTdpProfileByPublicCode(codigo);

  if (!profile) {
    notFound();
  }

  const previewBackground = buildPreviewBackground(
    profile.background_1,
    profile.background_2,
    profile.use_second_background,
  );
  const publicBaseUrl = getTdpPublicProfileBaseUrl();
  const publicUrl = `${publicBaseUrl}/perfil/${profile.profile_code}`;
  const selectedWidgets = profile.widget_ids
    .map((widgetId) => ({
      id: widgetId,
      config: profile.widget_configs[widgetId],
    }))
    .filter((entry) => Boolean(entry.config));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#363d4a_0%,_#232833_42%,_#171b23_100%)] px-4 py-5 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[430px] flex-col">
        <section className="rounded-[1.95rem] border border-[#3d392d] bg-[#151515] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
          <div
            className="rounded-[1.65rem] border border-[#25221b] px-5 pb-5 pt-5"
            style={{ background: previewBackground, color: profile.text_color }}
          >
            <div className="flex flex-col items-center text-center">
              {profile.widget_configs.photo?.file_url ? (
                <img
                  src={profile.widget_configs.photo.file_url}
                  alt={profile.full_name || "Foto de perfil"}
                  className="mb-4 h-24 w-24 rounded-full border border-white/15 object-cover shadow-lg"
                />
              ) : null}
              <div className="text-[1.7rem] font-extrabold leading-tight">
                {profile.full_name || "Perfil digital"}
              </div>
              <div className="mt-2 text-[1.02rem] text-white/65">
                {profile.description || "Gerente"}
              </div>
              {profile.show_save_contact ? (
                <a
                  href="#widgets"
                  className="mt-6 inline-flex min-w-[185px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_14px_24px_rgba(73,112,236,0.3)] transition"
                  style={{ backgroundColor: profile.main_button_color }}
                >
                  Guardar contacto
                </a>
              ) : null}
            </div>

            <div id="widgets" className="mt-5 grid gap-3">
              {selectedWidgets.length > 0 ? (
                selectedWidgets.map((entry) => {
                  const widgetId = entry.id;
                  const widget = entry.config as Record<string, string | null>;

                  switch (widgetId) {
                    case "photo":
                      return null;
                    case "whatsapp":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="WhatsApp"
                          href={getWhatsappUrl(
                            String(widget.country_code ?? "+56"),
                            String(widget.number ?? ""),
                            String(widget.message ?? ""),
                          )}
                          toneClassName="from-emerald-500 to-emerald-400"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "phone":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="Teléfono"
                          href={getTelUrl(
                            String(widget.country_code ?? "+56"),
                            String(widget.number ?? ""),
                          )}
                          toneClassName="from-emerald-500 to-emerald-400"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "email":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="Email"
                          href={getMailTo(
                            String(widget.email ?? ""),
                            String(widget.subject ?? ""),
                          )}
                          toneClassName="from-rose-500 to-orange-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "instagram":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="Instagram"
                          href={normalizePublicUrl(
                            `https://instagram.com/${String(widget.username ?? "").replace(/^@/, "")}`,
                          )}
                          toneClassName="from-fuchsia-500 to-violet-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "linkedin":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="LinkedIn"
                          href={normalizePublicUrl(String(widget.url ?? ""))}
                          toneClassName="from-blue-500 to-sky-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "website":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="Sitio Web"
                          href={normalizePublicUrl(String(widget.url ?? ""))}
                          toneClassName="from-blue-500 to-sky-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "location":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label={widget.title || "Ubicación"}
                          href={normalizePublicUrl(String(widget.maps_url ?? ""))}
                          toneClassName="from-rose-500 to-orange-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "transfer": {
                      const copyText = [
                        widget.company_name ? `Nombre: ${widget.company_name}` : null,
                        widget.rut ? `RUT: ${widget.rut}` : null,
                        widget.bank ? `Banco: ${widget.bank}` : null,
                        widget.account_type ? `Tipo cuenta: ${widget.account_type}` : null,
                        widget.account_number ? `Numero cuenta: ${widget.account_number}` : null,
                        widget.confirmation_email ? `Email: ${widget.confirmation_email}` : null,
                      ]
                        .filter(Boolean)
                        .join("\n");

                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label="Transferencia"
                          copyText={copyText}
                          toneClassName="from-fuchsia-500 to-violet-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    }
                    case "pdf":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label={widget.title || "PDF/Documento"}
                          href={
                            widget.storage_path
                              ? getStorageProxyUrl(widget.storage_path)
                              : widget.file_url ?? undefined
                          }
                          toneClassName="from-rose-500 to-orange-500"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    case "custom":
                      return (
                        <PublicWidgetAction
                          key={widgetId}
                          label={widget.label || "Enlace personalizado"}
                          href={normalizePublicUrl(String(widget.url ?? ""))}
                          toneClassName="from-zinc-500 to-zinc-400"
                          icon={<WidgetGlyph widgetId={widgetId} />}
                        />
                      );
                    default:
                      return null;
                  }
                })
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-[#3a3428] bg-[#171717] p-6 text-sm text-white/55">
                  Este perfil no tiene widgets publicados todavia.
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col items-center gap-2 text-center">
              <div className="text-[0.72rem] text-white/45">Powered by: lopva.cl</div>
            </div>
          </div>
        </section>

        <a href={publicUrl} className="sr-only">
          {profile.profile_code}
        </a>
      </div>
    </main>
  );
}
