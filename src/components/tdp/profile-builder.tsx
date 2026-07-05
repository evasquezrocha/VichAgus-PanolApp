"use client";

import { FlashBanner } from "@/components/ui/flash-banner";
import { saveTdpProfileConfigAction } from "@/app/tdp/panel/perfil/actions";
import { PublicSaveContactButton } from "@/components/tdp/public-save-contact-button";
import { PublicWidgetAction } from "@/components/tdp/public-widget-action";
import {
  DEFAULT_TDP_PROFILE_CONFIG,
  TDP_WIDGET_DEFINITIONS,
  TDP_WIDGET_IDS,
  createDefaultTdpWidgetConfig,
  normalizeTdpWidgetConfigMap,
  type TdpWidgetPhotoConfig,
  type TdpWidgetWhatsappConfig,
  type TdpWidgetPhoneConfig,
  type TdpWidgetEmailConfig,
  type TdpWidgetInstagramConfig,
  type TdpWidgetLinkedInConfig,
  type TdpWidgetWebsiteConfig,
  type TdpWidgetLocationConfig,
  type TdpWidgetTransferConfig,
  type TdpWidgetPdfConfig,
  type TdpWidgetCustomLinkConfig,
  type TdpProfileConfig,
  type TdpWidgetId,
} from "@/types/tdp-profile";
import type { FlashMessage } from "@/lib/flash";
import Image from "next/image";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { useMemo, useState } from "react";

type TdpProfileBuilderProps = {
  flash: FlashMessage | null;
  initialConfig: TdpProfileConfig;
  userName: string;
  targetUserId: string;
  returnTo: string;
};

type DragState = {
  widgetId: TdpWidgetId;
} | null;

type PendingFiles = Partial<Record<"photo" | "pdf", string>>;

const COUNTRY_CODES = [
  { value: "+56", label: "Chile (+56)" },
  { value: "+54", label: "Argentina (+54)" },
  { value: "+57", label: "Colombia (+57)" },
  { value: "+51", label: "Perú (+51)" },
  { value: "+52", label: "México (+52)" },
  { value: "+593", label: "Ecuador (+593)" },
  { value: "+34", label: "España (+34)" },
  { value: "+1", label: "EE.UU. / Canadá (+1)" },
];

function WidgetIcon({
  widgetId,
  className = "h-7 w-7",
}: {
  widgetId: TdpWidgetId;
  className?: string;
}) {
  const iconProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (widgetId) {
    case "photo":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2l1-1.5h5L15.5 5h2A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M20 11.7A8 8 0 1 1 8.3 5l1.2-.2a8 8 0 0 1 10.5 7.7Z" />
          <path d="M9.2 8.2c.2-.4.7-.7 1.1-.7h.4c.4 0 .8.2 1 .6l.6 1.3c.2.5.1 1-.2 1.4l-.7.8c-.2.2-.2.6 0 .9.7 1.4 1.9 2.6 3.3 3.3.3.2.7.2.9 0l.8-.7c.4-.4.9-.4 1.4-.2l1.4.6c.4.2.6.6.6 1v.5c0 .5-.2.9-.7 1.1-.7.3-1.5.4-2.2.2-3.8-1-7.1-4.3-8.1-8.1-.2-.7-.1-1.5.2-2.2Z" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M7.4 4.5h2.8l1.4 4-1.8 1.8a13 13 0 0 0 3.9 3.9l1.8-1.8 4 1.4v2.8c0 .9-.7 1.6-1.6 1.6C9.9 18.2 5.8 14.1 5.8 8.6c0-.9.7-1.6 1.6-1.6Z" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
          <path d="m4.8 7.2 7.2 5.8 7.2-5.8" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          <path d="M8.2 10v6" />
          <path d="M8.2 8.2v.2" />
          <path d="M11.2 16v-3.5c0-1.3.8-2.2 2-2.2 1.1 0 1.8.8 1.8 2.2V16" />
          <path d="M14.8 10v6" />
        </svg>
      );
    case "website":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2.2 2.4 3.3 5 3.3 8s-1.1 5.6-3.3 8c-2.2-2.4-3.3-5-3.3-8S9.8 6.4 12 4Z" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.1" />
        </svg>
      );
    case "transfer":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <rect x="3.5" y="6" width="17" height="11.5" rx="2.2" />
          <path d="M6 10h12" />
          <path d="M14.8 8.2 17 10l-2.2 1.8" />
          <path d="M9.2 15.8 7 14l2.2-1.8" />
        </svg>
      );
    case "pdf":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M7.2 3.5h7.6l4 4V20.5H7.2Z" />
          <path d="M14.8 3.5v4h4" />
          <path d="M9.2 14h5.6" />
          <path d="M9.2 17h3.4" />
        </svg>
      );
    case "custom":
      return (
        <svg viewBox="0 0 24 24" className={className} {...iconProps}>
          <path d="M10 14a4 4 0 0 1 0-5.7l1.2-1.2a4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7l-.8.8" />
          <path d="M14 10a4 4 0 0 1 0 5.7l-1.2 1.2a4 4 0 0 1-5.7 0 4 4 0 0 1 0-5.7l.8-.8" />
        </svg>
      );
    default:
      return null;
  }
}

function SmallIconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/85 transition hover:bg-white/15 hover:text-white"
    >
      {children}
    </button>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </svg>
  );
}

function ChevronUpDownIcon({ expanded }: { expanded: boolean }) {
  return expanded ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 10l5-5 5 5" />
      <path d="M7 14l5 5 5-5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 14l5 5 5-5" />
    </svg>
  );
}

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

function normalizePhoneNumber(countryCode: string, number: string) {
  const value = `${countryCode}${number}`.replace(/[^\d+]/g, "");
  return value.startsWith("+") ? value : `+${value.replace(/^\+/, "")}`;
}

function getStorageProxyUrl(storagePath: string) {
  return `/api/tdp/storage/${storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function PreviewWidgetGlyph({ widgetId }: { widgetId: TdpWidgetId }) {
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx="8" cy="7" r="1.3" />
      <circle cx="16" cy="7" r="1.3" />
      <circle cx="8" cy="12" r="1.3" />
      <circle cx="16" cy="12" r="1.3" />
      <circle cx="8" cy="17" r="1.3" />
      <circle cx="16" cy="17" r="1.3" />
    </svg>
  );
}

function CloudUploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 16V6" />
      <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
      <path d="M5 18h14" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16v10H8l-4 4Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function PaintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3a9 9 0 1 0 9 9c0-1.7-1.4-3-3.1-3H15a2 2 0 0 1-2-2V5.1A2.1 2.1 0 0 0 12 3Z" />
      <circle cx="7.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="5.8" cy="12.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h4" />
      <path d="M4 12h4" />
      <path d="M4 18h4" />
      <path d="M10 6h10" />
      <path d="M10 12h10" />
      <path d="M10 18h10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function mergeConfig(config: TdpProfileConfig): TdpProfileConfig {
  return {
    ...DEFAULT_TDP_PROFILE_CONFIG,
    ...config,
    widget_ids: config.widget_ids.filter((widgetId): widgetId is TdpWidgetId =>
      TDP_WIDGET_DEFINITIONS.some((definition) => definition.id === widgetId),
    ),
    widget_configs: normalizeTdpWidgetConfigMap(config.widget_configs),
  };
}

export function TdpProfileBuilder({
  flash,
  initialConfig,
  userName,
  targetUserId,
  returnTo,
}: TdpProfileBuilderProps) {
  const [config, setConfig] = useState<TdpProfileConfig>(() =>
    mergeConfig({
      ...DEFAULT_TDP_PROFILE_CONFIG,
      ...initialConfig,
      full_name: initialConfig.full_name || userName,
    }),
  );
  const [dragState, setDragState] = useState<DragState>(null);
  const [expandedWidgets, setExpandedWidgets] = useState<Partial<Record<TdpWidgetId, boolean>>>(
    () =>
      Object.fromEntries(
        TDP_WIDGET_IDS.map((widgetId) => [widgetId, config.widget_ids.includes(widgetId)]),
      ) as Partial<Record<TdpWidgetId, boolean>>,
  );
  const [pendingFiles, setPendingFiles] = useState<PendingFiles>({});

  const selectedDefinitions = useMemo(() => {
    return config.widget_ids
      .map((widgetId) =>
        TDP_WIDGET_DEFINITIONS.find((definition) => definition.id === widgetId),
      )
      .filter(
        (
          definition,
        ): definition is (typeof TDP_WIDGET_DEFINITIONS)[number] =>
          Boolean(definition),
      );
  }, [config.widget_ids]);

  const selectedPreviewWidgets = useMemo(() => {
    return config.widget_ids
      .map((widgetId) => ({
        id: widgetId,
        config: config.widget_configs[widgetId],
      }))
      .filter((entry) => Boolean(entry.config));
  }, [config.widget_configs, config.widget_ids]);

  const saveContactData = useMemo(() => {
    return selectedPreviewWidgets.reduce(
      (accumulator, entry) => {
        const widget = entry.config as Record<string, string | null>;

        switch (entry.id) {
          case "whatsapp":
            if (widget.number) {
              accumulator.phones.push({
                value: normalizePhoneNumber(
                  String(widget.country_code ?? "+56"),
                  String(widget.number ?? ""),
                ),
                types: ["CELL", "WHATSAPP"],
              });
            }
            break;
          case "phone":
            if (widget.number) {
              accumulator.phones.push({
                value: normalizePhoneNumber(
                  String(widget.country_code ?? "+56"),
                  String(widget.number ?? ""),
                ),
                types: ["CELL", "VOICE"],
              });
            }
            break;
          case "email":
            if (widget.email) {
              accumulator.emails.push(String(widget.email));
            }
            break;
          case "website":
            if (widget.url) {
              accumulator.urls.push(String(widget.url));
            }
            break;
          case "linkedin":
            if (widget.url) {
              accumulator.urls.push(String(widget.url));
            }
            break;
          case "location":
            if (widget.maps_url) {
              accumulator.urls.push(String(widget.maps_url));
            }
            if (widget.address) {
              accumulator.address = String(widget.address);
            } else if (widget.title && !accumulator.address) {
              accumulator.address = String(widget.title);
            }
            break;
          case "custom":
            if (widget.url) {
              accumulator.urls.push(String(widget.url));
            }
            break;
          default:
            break;
        }

        return accumulator;
      },
      {
        phones: [] as Array<{ value: string; types: string[] }>,
        emails: [] as string[],
        urls: [] as string[],
        address: "",
      },
    );
  }, [selectedPreviewWidgets]);

  const serializedConfig = useMemo(() => JSON.stringify(config), [config]);

  function updateConfig<K extends keyof TdpProfileConfig>(
    key: K,
    value: TdpProfileConfig[K],
  ) {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function setWidgetConfig<T extends TdpWidgetId>(
    widgetId: T,
    updater:
      | Partial<NonNullable<TdpProfileConfig["widget_configs"][T]>>
      | ((current: NonNullable<TdpProfileConfig["widget_configs"][T]>) => NonNullable<TdpProfileConfig["widget_configs"][T]>),
  ) {
    setConfig((current) => {
      const currentWidgetConfig =
        current.widget_configs[widgetId] ?? createDefaultTdpWidgetConfig(widgetId);

      const nextWidgetConfig =
        typeof updater === "function"
          ? updater(currentWidgetConfig as NonNullable<TdpProfileConfig["widget_configs"][T]>)
          : {
              ...currentWidgetConfig,
              ...updater,
            };

      return {
        ...current,
        widget_configs: {
          ...current.widget_configs,
          [widgetId]: nextWidgetConfig,
        },
      };
    });
  }

  function addWidget(widgetId: TdpWidgetId) {
    setConfig((current) => {
      if (current.widget_ids.includes(widgetId)) {
        return current;
      }

      return {
        ...current,
        widget_ids: [...current.widget_ids, widgetId],
        widget_configs: {
          ...current.widget_configs,
          [widgetId]:
            current.widget_configs[widgetId] ?? createDefaultTdpWidgetConfig(widgetId),
        },
      };
    });

    setExpandedWidgets((current) => ({ ...current, [widgetId]: true }));
  }

  function removeWidget(widgetId: TdpWidgetId) {
    setConfig((current) => {
      const nextWidgetConfigs = { ...current.widget_configs };
      delete nextWidgetConfigs[widgetId];

      return {
        ...current,
        widget_ids: current.widget_ids.filter((id) => id !== widgetId),
        widget_configs: nextWidgetConfigs,
      };
    });
  }

  function moveWidgetToIndex(widgetId: TdpWidgetId, targetIndex: number) {
    setConfig((current) => {
      const sourceIndex = current.widget_ids.indexOf(widgetId);
      if (sourceIndex === -1) {
        return current;
      }

      const nextWidgetIds = current.widget_ids.filter((id) => id !== widgetId);
      const adjustedTargetIndex =
        sourceIndex >= 0 && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const insertIndex = Math.max(
        0,
        Math.min(adjustedTargetIndex, nextWidgetIds.length),
      );

      nextWidgetIds.splice(insertIndex, 0, widgetId);

      return {
        ...current,
        widget_ids: nextWidgetIds,
      };
    });
  }

  function moveWidget(widgetId: TdpWidgetId, offset: number) {
    setConfig((current) => {
      const currentIndex = current.widget_ids.indexOf(widgetId);
      if (currentIndex === -1) {
        return current;
      }

      const targetIndex = currentIndex + offset;
      if (targetIndex < 0 || targetIndex >= current.widget_ids.length) {
        return current;
      }

      const nextWidgetIds = [...current.widget_ids];
      nextWidgetIds.splice(currentIndex, 1);
      nextWidgetIds.splice(targetIndex, 0, widgetId);

      return {
        ...current,
        widget_ids: nextWidgetIds,
      };
    });
  }

  function appendDraggedWidget() {
    if (!dragState) {
      return;
    }

    setConfig((current) => {
      if (current.widget_ids.includes(dragState.widgetId)) {
        return {
          ...current,
          widget_ids: current.widget_ids
            .filter((id) => id !== dragState.widgetId)
            .concat(dragState.widgetId),
        };
      }

      return {
        ...current,
        widget_ids: [...current.widget_ids, dragState.widgetId],
        widget_configs: {
          ...current.widget_configs,
          [dragState.widgetId]:
            current.widget_configs[dragState.widgetId] ??
            createDefaultTdpWidgetConfig(dragState.widgetId),
        },
      };
    });
    setExpandedWidgets((current) => ({ ...current, [dragState.widgetId]: true }));
    setDragState(null);
  }

  const previewBackground = useMemo(() => {
    return buildPreviewBackground(config);
  }, [config]);

  function getWidgetConfig<T extends TdpWidgetId>(widgetId: T) {
    return (config.widget_configs[widgetId] ??
      createDefaultTdpWidgetConfig(widgetId)) as NonNullable<TdpProfileConfig["widget_configs"][T]>;
  }

  function setFileName(widgetId: "photo" | "pdf", fileName: string) {
    setPendingFiles((current) => ({
      ...current,
      [widgetId]: fileName,
    }));
  }

  return (
    <form
      action={saveTdpProfileConfigAction}
      encType="multipart/form-data"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#4c5566_0%,_#262c3a_38%,_#151821_100%)] px-4 py-4 text-white sm:px-6 lg:px-10"
    >
      <input name="config_json" type="hidden" value={serializedConfig} readOnly />
      <input name="target_user_id" type="hidden" value={targetUserId} readOnly />
      <input name="return_to" type="hidden" value={returnTo} readOnly />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <FlashBanner flash={flash} />

        <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/25 text-blue-300">
              <UserIcon />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Información Básica</h2>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold">Nombre Completo *</span>
              <input
                value={config.full_name}
                onChange={(event) => updateConfig("full_name", event.target.value)}
                className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none ring-0 placeholder:text-white/30"
                placeholder="Nombre completo"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold">Empresa</span>
              <input
                value={config.company_name}
                onChange={(event) => updateConfig("company_name", event.target.value)}
                className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none ring-0 placeholder:text-white/30"
                placeholder="Empresa"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold">Descripción</span>
              <input
                value={config.description}
                onChange={(event) => updateConfig("description", event.target.value)}
                className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none ring-0 placeholder:text-white/30"
                placeholder="Descripción"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.95rem] border border-[#3d392d] bg-[#151515] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
          <div className="mx-auto flex w-full max-w-[430px] flex-col">
            <div
              className="rounded-[1.65rem] border border-[#25221b] px-5 pb-5 pt-5"
              style={{ background: previewBackground, color: config.text_color }}
            >
              <div className="flex flex-col items-center text-center">
                {config.widget_configs.photo?.file_url ? (
                  <Image
                    src={config.widget_configs.photo.file_url}
                    alt={config.full_name || "Foto de perfil"}
                    width={96}
                    height={96}
                    unoptimized
                    className="mb-4 h-24 w-24 rounded-full border border-white/15 object-cover shadow-lg"
                  />
                ) : null}
                <div className="text-[1.7rem] font-extrabold leading-tight">
                  {config.full_name || userName || "Perfil digital"}
                </div>
                <div className="mt-2 text-[1.02rem] text-white/65">
                  {config.description || "Gerente"}
                </div>
                {config.company_name ? (
                  <div className="mt-1 text-sm text-white/55">{config.company_name}</div>
                ) : null}
                {config.show_save_contact ? (
                  <PublicSaveContactButton
                    fullName={config.full_name || userName || "Perfil digital"}
                    companyName={config.company_name}
                    title={config.contact_title || config.description || ""}
                    photoUrl={config.widget_configs.photo?.file_url ?? null}
                    phones={saveContactData.phones}
                    emails={saveContactData.emails}
                    urls={saveContactData.urls}
                    address={saveContactData.address}
                    backgroundColor={config.main_button_color}
                  />
                ) : null}
              </div>

              <div id="widgets" className="mt-5 grid gap-3">
                {selectedPreviewWidgets.length > 0 ? (
                  selectedPreviewWidgets.map((entry) => {
                    const widget = entry.config as Record<string, string | null>;

                    switch (entry.id) {
                      case "photo":
                        return null;
                      case "whatsapp":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="WhatsApp"
                            href={getWhatsappUrl(
                              String(widget.country_code ?? "+56"),
                              String(widget.number ?? ""),
                              String(widget.message ?? ""),
                            )}
                            toneClassName="from-emerald-500 to-emerald-400"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "phone":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="Teléfono"
                            href={getTelUrl(
                              String(widget.country_code ?? "+56"),
                              String(widget.number ?? ""),
                            )}
                            toneClassName="from-emerald-500 to-emerald-400"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "email":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="Email"
                            href={getMailTo(
                              String(widget.email ?? ""),
                              String(widget.subject ?? ""),
                            )}
                            toneClassName="from-rose-500 to-orange-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "instagram":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="Instagram"
                            href={normalizePublicUrl(
                              `https://instagram.com/${String(widget.username ?? "").replace(/^@/, "")}`,
                            )}
                            toneClassName="from-fuchsia-500 to-violet-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "linkedin":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="LinkedIn"
                            href={normalizePublicUrl(String(widget.url ?? ""))}
                            toneClassName="from-blue-500 to-sky-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "website":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="Sitio Web"
                            href={normalizePublicUrl(String(widget.url ?? ""))}
                            toneClassName="from-blue-500 to-sky-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "location":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label={widget.title || "Ubicación"}
                            href={normalizePublicUrl(String(widget.maps_url ?? ""))}
                            toneClassName="from-rose-500 to-orange-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "transfer": {
                        const copyText = [
                          widget.company_name ? `Nombre: ${widget.company_name}` : null,
                          widget.rut ? `RUT: ${widget.rut}` : null,
                          widget.bank ? `Banco: ${widget.bank}` : null,
                          widget.account_type ? `Tipo cuenta: ${widget.account_type}` : null,
                          widget.account_number ? `Numero cuenta: ${widget.account_number}` : null,
                          widget.confirmation_email
                            ? `Email: ${widget.confirmation_email}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("\n");

                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label="Datos Transferencia"
                            copyText={copyText}
                            toneClassName="from-fuchsia-500 to-violet-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      }
                      case "pdf":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label={widget.title || "PDF/Documento"}
                            href={
                              widget.storage_path
                                ? getStorageProxyUrl(widget.storage_path)
                                : widget.file_url ?? undefined
                            }
                            toneClassName="from-rose-500 to-orange-500"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      case "custom":
                        return (
                          <PublicWidgetAction
                            key={entry.id}
                            label={widget.label || "Enlace personalizado"}
                            href={normalizePublicUrl(String(widget.url ?? ""))}
                            toneClassName="from-zinc-500 to-zinc-400"
                            icon={<PreviewWidgetGlyph widgetId={entry.id} />}
                          />
                        );
                      default:
                        return null;
                    }
                  })
                ) : (
                  <div className="rounded-[1.15rem] border border-dashed border-[#3a3428] bg-[#171717] p-6 text-sm text-white/55">
                    Este perfil no tiene widgets publicados todavía.
                  </div>
                )}
              </div>

              <div className="mt-7 flex flex-col items-center gap-2 text-center">
                <div className="text-[0.72rem] text-white/45">Powered by: lopva.cl</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/25 text-blue-300">
              <PaintIcon />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Personalización de Colores
            </h2>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <ColorField
                label="Color de Fondo 1"
                value={config.background_1}
                onChange={(value) => updateConfig("background_1", value)}
              />
              <label className="flex flex-col gap-2">
                <span className="text-base font-semibold"> </span>
                <div className="flex h-[58px] items-center rounded-2xl border border-white/10 bg-white/10 px-4">
                  <label className="flex items-center gap-3 text-base font-medium">
                    <input
                      checked={config.use_second_background}
                      onChange={(event) =>
                        updateConfig("use_second_background", event.target.checked)
                      }
                      type="checkbox"
                      className="h-5 w-5 rounded border-white/30 bg-transparent"
                    />
                    <span>
                      <span className="block font-semibold">
                        Activar segundo color de fondo
                      </span>
                      <span className="block text-sm opacity-70">
                        Crea un gradiente entre dos colores
                      </span>
                    </span>
                  </label>
                </div>
              </label>
            </div>

            {config.use_second_background ? (
              <ColorField
                label="Color de Fondo 2"
                value={config.background_2}
                onChange={(value) => updateConfig("background_2", value)}
              />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              <ColorField
                label="Color de Texto"
                value={config.text_color}
                onChange={(value) => updateConfig("text_color", value)}
              />
              <ColorField
                label="Color Botones Principales"
                value={config.main_button_color}
                onChange={(value) => updateConfig("main_button_color", value)}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <ColorField
                label="Color Iconos (Widgets)"
                value={config.icon_color}
                onChange={(value) => updateConfig("icon_color", value)}
              />
              <ColorField
                label="Fondo Botones (Widgets)"
                value={config.widget_button_bg}
                onChange={(value) => updateConfig("widget_button_bg", value)}
              />
              <ColorField
                label="Texto Botones (Widgets)"
                value={config.widget_button_text}
                onChange={(value) => updateConfig("widget_button_text", value)}
              />
            </div>

            <ColorField
              label="Hover Botones (Widgets)"
              value={config.widget_button_hover}
              onChange={(value) => updateConfig("widget_button_hover", value)}
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/25 text-blue-300">
              <ListIcon />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Widgets Agregados (Arrastra para reordenar)
            </h2>
          </div>

          <div
            className="mt-6 rounded-[1.5rem] border-2 border-dashed border-white/15 bg-slate-950/70 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              appendDraggedWidget();
            }}
          >
            {selectedDefinitions.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[1.25rem] border border-blue-500/20 bg-slate-950/80 p-8 text-center text-white/75">
                <div>
                  <div className="text-6xl">🧩</div>
                  <p className="mt-4 text-lg">
                    Agrega widgets desde abajo para comenzar a construir tu perfil
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDefinitions.map((widget, index) => {
                  if (!widget) {
                    return null;
                  }

                  const widgetConfig = getWidgetConfig(widget.id);
                  const expanded = expandedWidgets[widget.id] ?? true;

                  return (
                    <article
                      key={widget.id}
                      draggable
                      onDragStart={() => setDragState({ widgetId: widget.id })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (dragState) {
                          moveWidgetToIndex(dragState.widgetId, index);
                          setDragState(null);
                        }
                      }}
                      onDragEnd={() => setDragState(null)}
                      className="rounded-[1.5rem] border border-white/10 bg-[#111827]/85 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
                    >
                      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${widgetToneClasses[widget.tone]} text-white shadow-md`}
                        >
                          <WidgetIcon widgetId={widget.id} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-extrabold leading-tight">{widget.label}</p>
                          <p className="text-sm text-white/55">
                            Arrastra para reordenar o usa los botones laterales
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <SmallIconButton
                            label="Mover arriba"
                            onClick={() => moveWidget(widget.id, -1)}
                          >
                            <ArrowUpIcon />
                          </SmallIconButton>
                          <SmallIconButton
                            label="Mover abajo"
                            onClick={() => moveWidget(widget.id, 1)}
                          >
                            <ArrowDownIcon />
                          </SmallIconButton>
                          <SmallIconButton
                            label={expanded ? "Colapsar widget" : "Expandir widget"}
                            onClick={() =>
                              setExpandedWidgets((current) => ({
                                ...current,
                                [widget.id]: !expanded,
                              }))
                            }
                          >
                            <ChevronUpDownIcon expanded={expanded} />
                          </SmallIconButton>
                          <SmallIconButton
                            label="Eliminar"
                            onClick={() => removeWidget(widget.id)}
                          >
                            <TrashIcon />
                          </SmallIconButton>
                          <div
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white/70"
                            title="Arrastrar"
                          >
                            <GripIcon />
                          </div>
                        </div>
                      </div>

                      {expanded ? (
                        <div className="p-5">
                          <WidgetEditor
                            widgetId={widget.id}
                            widgetConfig={widgetConfig}
                            pendingFiles={pendingFiles}
                            setFileName={setFileName}
                            onUpdate={(updater) => setWidgetConfig(widget.id, updater)}
                          />
                        </div>
                      ) : (
                        <div className="px-5 py-3 text-xs text-white/45">
                          Widget colapsado.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/25 text-blue-300">
              <PlusIcon />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Agregar Widgets</h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {TDP_WIDGET_DEFINITIONS.map((widget) => {
              const active = config.widget_ids.includes(widget.id);

              return (
                <button
                  key={widget.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragState({ widgetId: widget.id })}
                  onDragEnd={() => setDragState(null)}
                  onClick={() => addWidget(widget.id)}
                  className={`flex min-h-[112px] flex-col items-center justify-center rounded-2xl border px-3 py-4 text-center font-semibold text-white shadow-lg transition ${
                    active ? "border-white/25 opacity-55" : "border-white/10"
                  } bg-gradient-to-br ${widgetToneClasses[widget.tone]}`}
                >
                  <WidgetIcon widgetId={widget.id} className="h-8 w-8" />
                  <span className="mt-3 text-base leading-tight">{widget.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/25 text-blue-300">
              <MessageIcon />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Datos para &quot;Guardar Contacto&quot;
            </h2>
          </div>
          <p className="mt-4 text-white/85">
            Define cómo se verá tu nombre y subtítulo al guardar el contacto en el teléfono.
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                checked={config.show_save_contact}
                onChange={(event) => updateConfig("show_save_contact", event.target.checked)}
                type="checkbox"
                className="peer sr-only"
              />
              <div className="h-9 w-16 rounded-full bg-blue-600/70 peer-checked:bg-blue-500" />
            </label>
            <div>
              <div className="text-base font-semibold">
                Mostrar botón &quot;Guardar Contacto&quot;
              </div>
              <div className="text-sm text-white/65">
                Desactiva esta opción si no deseas que aparezca el botón para guardar contacto en el perfil.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold">Nombre Completo</span>
              <input
                value={config.full_name}
                onChange={(event) => updateConfig("full_name", event.target.value)}
                className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none"
              />
              <span className="text-sm text-white/65">
                Si está vacío, usará el &quot;Nombre Completo&quot; principal.
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold">Título o Cargo</span>
              <input
                value={config.contact_title}
                onChange={(event) => updateConfig("contact_title", event.target.value)}
                className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none"
                placeholder="Ej: Gerente de Ventas en Mi Empresa"
              />
              <span className="text-sm text-white/65">
                Si está vacío, se guardará sin título.
              </span>
            </label>
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 border-t border-white/10 pt-8">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-[0_12px_28px_rgba(59,130,246,0.35)] transition hover:bg-blue-500"
          >
            Guardar Perfil
          </button>

          <Link
            href="/tdp/panel"
            className="inline-flex items-center justify-center rounded-xl border border-blue-400/60 bg-white/5 px-8 py-4 text-lg font-semibold text-blue-200 transition hover:bg-white/10"
          >
            Volver al Panel
          </Link>
        </section>
      </div>
    </form>
  );
}

function WidgetEditor({
  widgetId,
  widgetConfig,
  pendingFiles,
  setFileName,
  onUpdate,
}: {
  widgetId: TdpWidgetId;
  widgetConfig: NonNullable<TdpProfileConfig["widget_configs"][TdpWidgetId]>;
  pendingFiles: PendingFiles;
  setFileName: (widgetId: "photo" | "pdf", fileName: string) => void;
  onUpdate: (
    updater:
      | Partial<NonNullable<TdpProfileConfig["widget_configs"][TdpWidgetId]>>
      | ((current: NonNullable<TdpProfileConfig["widget_configs"][TdpWidgetId]>) => NonNullable<TdpProfileConfig["widget_configs"][TdpWidgetId]>),
  ) => void;
}) {
  switch (widgetId) {
    case "photo":
      const photoConfig = widgetConfig as TdpWidgetPhotoConfig;
      return (
        <div className="space-y-4">
          <FileDropzone
            title="Foto/Logo"
            description="Haz clic o arrastra para subir tu foto/logo"
            helper="Formatos: JPG, PNG, GIF, WEBP"
            accepted="image/*"
            fieldName="widget_photo_file"
            currentFileName={pendingFiles.photo ?? photoConfig.file_name ?? null}
            emptyLabel="No hay imagen seleccionada."
            icon={<CloudUploadIcon />}
            accentClassName="border-emerald-400/50 bg-emerald-400/8 text-emerald-300"
            onSelect={(fileName) => setFileName("photo", fileName)}
          />
        </div>
      );
    case "whatsapp":
      const whatsappConfig = widgetConfig as TdpWidgetWhatsappConfig;
      return (
        <div className="grid gap-5">
          <SelectField
            label="Código País *"
            value={whatsappConfig.country_code}
            onChange={(value) => onUpdate({ country_code: value })}
            options={COUNTRY_CODES}
          />
          <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
            <SelectField
              label="Número de WhatsApp *"
              value={whatsappConfig.country_code}
              onChange={(value) => onUpdate({ country_code: value })}
              options={COUNTRY_CODES}
            />
            <TextField
              label=" "
              value={whatsappConfig.number}
              onChange={(value) => onUpdate({ number: value })}
              placeholder="912345678"
              inputMode="tel"
            />
          </div>
          <TextAreaField
            label="Mensaje predefinido (opcional)"
            value={whatsappConfig.message}
            onChange={(value) => onUpdate({ message: value })}
            placeholder="Hola! Te escribo desde tu tarjeta digital"
          />
        </div>
      );
    case "phone":
      const phoneConfig = widgetConfig as TdpWidgetPhoneConfig;
      return (
        <div className="grid gap-5">
          <SelectField
            label="Código País *"
            value={phoneConfig.country_code}
            onChange={(value) => onUpdate({ country_code: value })}
            options={COUNTRY_CODES}
          />
          <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
            <SelectField
              label="Número de teléfono *"
              value={phoneConfig.country_code}
              onChange={(value) => onUpdate({ country_code: value })}
              options={COUNTRY_CODES}
            />
            <TextField
              label=" "
              value={phoneConfig.number}
              onChange={(value) => onUpdate({ number: value })}
              placeholder="912345678"
              inputMode="tel"
            />
          </div>
          <TextField
            label="Etiqueta (opcional)"
            value={phoneConfig.label}
            onChange={(value) => onUpdate({ label: value })}
            placeholder="Teléfono principal"
          />
        </div>
      );
    case "email":
      const emailConfig = widgetConfig as TdpWidgetEmailConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="Dirección de email *"
            value={emailConfig.email}
            onChange={(value) => onUpdate({ email: value })}
            placeholder="tu@email.com"
            inputMode="email"
          />
          <TextField
            label="Asunto predefinido (opcional)"
            value={emailConfig.subject}
            onChange={(value) => onUpdate({ subject: value })}
            placeholder="Contacto desde tarjeta digital"
          />
        </div>
      );
    case "instagram":
      const instagramConfig = widgetConfig as TdpWidgetInstagramConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="Usuario de Instagram *"
            value={instagramConfig.username}
            onChange={(value) => onUpdate({ username: value })}
            placeholder="@tuusuario o tuusuario"
          />
        </div>
      );
    case "linkedin":
      const linkedinConfig = widgetConfig as TdpWidgetLinkedInConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="URL de LinkedIn *"
            value={linkedinConfig.url}
            onChange={(value) => onUpdate({ url: value })}
            placeholder="linkedin.com/in/tuperfil o https://..."
          />
        </div>
      );
    case "website":
      const websiteConfig = widgetConfig as TdpWidgetWebsiteConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="URL del sitio web *"
            value={websiteConfig.url}
            onChange={(value) => onUpdate({ url: value })}
            placeholder="https://tusitio.cl"
          />
        </div>
      );
    case "location":
      const locationConfig = widgetConfig as TdpWidgetLocationConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="URL de Google Maps (opcional)"
            value={locationConfig.maps_url}
            onChange={(value) => onUpdate({ maps_url: value })}
            placeholder="goo.gl/maps/tuubicacion o https://..."
          />
          <TextField
            label="Dirección escrita (opcional)"
            value={locationConfig.address}
            onChange={(value) => onUpdate({ address: value })}
            placeholder="Av. Siempre Viva 742, Santiago"
          />
          <TextField
            label="Título de la ubicación (opcional)"
            value={locationConfig.title}
            onChange={(value) => onUpdate({ title: value })}
            placeholder="Nuestra Tienda"
          />
        </div>
      );
    case "transfer":
      const transferConfig = widgetConfig as TdpWidgetTransferConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="Nombre de la empresa *"
            value={transferConfig.company_name}
            onChange={(value) => onUpdate({ company_name: value })}
            placeholder="Mi Empresa SPA"
          />
          <TextField
            label="RUT *"
            value={transferConfig.rut}
            onChange={(value) => onUpdate({ rut: value })}
            placeholder="12.345.678-9"
          />
          <TextField
            label="Banco *"
            value={transferConfig.bank}
            onChange={(value) => onUpdate({ bank: value })}
            placeholder="Banco de Chile"
          />
          <SelectField
            label="Tipo de cuenta *"
            value={transferConfig.account_type}
            onChange={(value) => onUpdate({ account_type: value })}
            options={[
              { value: "Cuenta Corriente", label: "Cuenta Corriente" },
              { value: "Cuenta Vista", label: "Cuenta Vista" },
              { value: "Cuenta de Ahorro", label: "Cuenta de Ahorro" },
              { value: "Cuenta RUT", label: "Cuenta RUT" },
            ]}
          />
          <TextField
            label="Número de cuenta *"
            value={transferConfig.account_number}
            onChange={(value) => onUpdate({ account_number: value })}
            placeholder="12345678"
          />
          <TextField
            label="Email de confirmación"
            value={transferConfig.confirmation_email}
            onChange={(value) => onUpdate({ confirmation_email: value })}
            placeholder="pagos@empresa.com"
            inputMode="email"
          />
        </div>
      );
    case "pdf":
      const pdfConfig = widgetConfig as TdpWidgetPdfConfig;
      return (
        <div className="space-y-4">
          <FileDropzone
            title="PDF / Documento"
            description="Haz clic o arrastra para subir tu archivo"
            helper="Formatos: PDF, DOC, DOCX"
            accepted=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            fieldName="widget_pdf_file"
            currentFileName={pendingFiles.pdf ?? pdfConfig.file_name ?? null}
            emptyLabel="No hay archivo seleccionado."
            icon={<CloudUploadIcon />}
            accentClassName="border-red-400/50 bg-red-400/8 text-red-300"
            onSelect={(fileName) => setFileName("pdf", fileName)}
          />
          <TextField
            label="Título del documento"
            value={pdfConfig.title}
            onChange={(value) => onUpdate({ title: value })}
            placeholder="Documento adjunto"
          />
          <TextField
            label="Descripción"
            value={pdfConfig.description}
            onChange={(value) => onUpdate({ description: value })}
            placeholder="Catálogo, ficha técnica o contrato"
          />
        </div>
      );
    case "custom":
      const customConfig = widgetConfig as TdpWidgetCustomLinkConfig;
      return (
        <div className="grid gap-5">
          <TextField
            label="Etiqueta"
            value={customConfig.label}
            onChange={(value) => onUpdate({ label: value })}
            placeholder="Mi enlace"
          />
          <TextField
            label="URL"
            value={customConfig.url}
            onChange={(value) => onUpdate({ url: value })}
            placeholder="https://..."
          />
        </div>
      );
    default:
      return null;
  }
}

function FileDropzone({
  title,
  description,
  helper,
  accepted,
  fieldName,
  currentFileName,
  emptyLabel,
  icon,
  accentClassName,
  onSelect,
}: {
  title: string;
  description: string;
  helper: string;
  accepted: string;
  fieldName: string;
  currentFileName: string | null;
  emptyLabel: string;
  icon: ReactNode;
  accentClassName: string;
  onSelect: (fileName: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-base font-semibold">{title}</span>
      <div
        className={`grid min-h-[210px] cursor-pointer place-items-center rounded-[1.5rem] border-2 border-dashed px-6 py-8 text-center transition ${accentClassName}`}
      >
        <div className="max-w-[430px]">
          <div className="flex justify-center text-current">{icon}</div>
          <div className="mt-4 text-lg font-bold">{description}</div>
          <div className="mt-2 text-sm opacity-80">{helper}</div>
          <div className="mt-3 text-sm opacity-85">{currentFileName ?? emptyLabel}</div>
        </div>
        <input
          type="file"
          accept={accepted}
          name={fieldName}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelect(file.name);
            }
          }}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-semibold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  readOnly,
  className,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-semibold">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        inputMode={inputMode}
        className={[
          "h-14 rounded-xl border border-white/10 bg-white/15 px-4 text-lg outline-none placeholder:text-white/30",
          className ?? "",
        ].join(" ")}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] rounded-xl border border-white/10 bg-white/15 px-4 py-3 text-lg outline-none placeholder:text-white/30"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-semibold">{label}</span>
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full rounded-xl border border-white/10 bg-white/10 p-2"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 rounded-xl border border-white/10 bg-white/15 px-4 font-mono text-lg outline-none"
        />
      </div>
    </label>
  );
}

const widgetToneClasses: Record<
  (typeof TDP_WIDGET_DEFINITIONS)[number]["tone"],
  string
> = {
  green: "from-emerald-500 to-emerald-400",
  blue: "from-blue-500 to-sky-500",
  red: "from-rose-500 to-orange-500",
  purple: "from-fuchsia-500 to-violet-500",
  gray: "from-zinc-500 to-zinc-400",
  gold: "from-amber-500 to-orange-400",
  teal: "from-cyan-500 to-teal-400",
};
