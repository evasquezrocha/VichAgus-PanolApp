export const TDP_WIDGET_IDS = [
  "photo",
  "whatsapp",
  "phone",
  "email",
  "instagram",
  "linkedin",
  "website",
  "location",
  "transfer",
  "pdf",
  "custom",
] as const;

export type TdpWidgetId = (typeof TDP_WIDGET_IDS)[number];

export type TdpProfileConfig = {
  profile_code: string;
  full_name: string;
  company_name: string;
  description: string;
  background_1: string;
  use_second_background: boolean;
  background_2: string;
  text_color: string;
  main_button_color: string;
  icon_color: string;
  widget_button_bg: string;
  widget_button_text: string;
  widget_button_hover: string;
  show_save_contact: boolean;
  contact_title: string;
  widget_ids: TdpWidgetId[];
  widget_configs: TdpWidgetConfigMap;
};

export const DEFAULT_TDP_PROFILE_CONFIG: TdpProfileConfig = {
  profile_code: "",
  full_name: "",
  company_name: "",
  description: "",
  background_1: "#0A0A0A",
  use_second_background: true,
  background_2: "#1F2937",
  text_color: "#E0E0E0",
  main_button_color: "#3B82F6",
  icon_color: "#60A5FA",
  widget_button_bg: "#1A1A1A",
  widget_button_text: "#FFFFFF",
  widget_button_hover: "#2A2A2A",
  show_save_contact: true,
  contact_title: "",
  widget_ids: [],
  widget_configs: {},
};

export type TdpWidgetDefinition = {
  id: TdpWidgetId;
  label: string;
  tone: "green" | "blue" | "red" | "purple" | "gray" | "gold" | "teal";
};

export const TDP_WIDGET_DEFINITIONS: TdpWidgetDefinition[] = [
  { id: "photo", label: "Subir Foto/Logo", tone: "green" },
  { id: "whatsapp", label: "WhatsApp", tone: "green" },
  { id: "phone", label: "Teléfono", tone: "green" },
  { id: "email", label: "Email", tone: "red" },
  { id: "instagram", label: "Instagram", tone: "purple" },
  { id: "linkedin", label: "LinkedIn", tone: "blue" },
  { id: "website", label: "Sitio Web", tone: "blue" },
  { id: "location", label: "Ubicación", tone: "red" },
  { id: "transfer", label: "Transferencia", tone: "purple" },
  { id: "pdf", label: "PDF/Documento", tone: "red" },
  { id: "custom", label: "Enlace Personalizado", tone: "gray" },
];

export type TdpWidgetPhotoConfig = {
  file_name: string | null;
  file_url: string | null;
  storage_path: string | null;
};

export type TdpWidgetMediaConfig = {
  file_name: string | null;
  file_url: string | null;
  storage_path: string | null;
};

export type TdpWidgetWhatsappConfig = {
  country_code: string;
  number: string;
  message: string;
};

export type TdpWidgetPhoneConfig = {
  country_code: string;
  number: string;
  label: string;
};

export type TdpWidgetEmailConfig = {
  email: string;
  subject: string;
};

export type TdpWidgetInstagramConfig = {
  username: string;
};

export type TdpWidgetLinkedInConfig = {
  url: string;
};

export type TdpWidgetWebsiteConfig = {
  url: string;
};

export type TdpWidgetLocationConfig = {
  maps_url: string;
  address: string;
  title: string;
};

export type TdpWidgetTransferConfig = {
  company_name: string;
  rut: string;
  bank: string;
  account_type: string;
  account_number: string;
  confirmation_email: string;
};

export type TdpWidgetPdfConfig = {
  file_name: string | null;
  file_url: string | null;
  storage_path: string | null;
  title: string;
  description: string;
};

export type TdpWidgetCustomLinkConfig = {
  label: string;
  url: string;
};

export type TdpWidgetConfigMap = Partial<{
  photo: TdpWidgetPhotoConfig;
  whatsapp: TdpWidgetWhatsappConfig;
  phone: TdpWidgetPhoneConfig;
  email: TdpWidgetEmailConfig;
  instagram: TdpWidgetInstagramConfig;
  linkedin: TdpWidgetLinkedInConfig;
  website: TdpWidgetWebsiteConfig;
  location: TdpWidgetLocationConfig;
  transfer: TdpWidgetTransferConfig;
  pdf: TdpWidgetPdfConfig;
  custom: TdpWidgetCustomLinkConfig;
}>;

export const DEFAULT_TDP_WIDGET_CONFIGS: TdpWidgetConfigMap = {
  photo: {
    file_name: null,
    file_url: null,
    storage_path: null,
  },
  whatsapp: {
    country_code: "+56",
    number: "",
    message: "Hola! Te escribo desde tu tarjeta digital",
  },
  phone: {
    country_code: "+56",
    number: "",
    label: "Teléfono principal",
  },
  email: {
    email: "",
    subject: "Contacto desde tarjeta digital",
  },
  instagram: {
    username: "",
  },
  linkedin: {
    url: "",
  },
  website: {
    url: "",
  },
  location: {
    maps_url: "",
    address: "",
    title: "",
  },
  transfer: {
    company_name: "",
    rut: "",
    bank: "",
    account_type: "Cuenta Corriente",
    account_number: "",
    confirmation_email: "",
  },
  pdf: {
    file_name: null,
    file_url: null,
    storage_path: null,
    title: "Documento adjunto",
    description: "",
  },
  custom: {
    label: "Enlace personalizado",
    url: "",
  },
};

export function createDefaultTdpWidgetConfig<T extends TdpWidgetId>(
  widgetId: T,
): NonNullable<TdpWidgetConfigMap[T]> {
  const config = DEFAULT_TDP_WIDGET_CONFIGS[widgetId];

  if (!config) {
    throw new Error(`No default widget config found for ${widgetId}.`);
  }

  return JSON.parse(JSON.stringify(config)) as NonNullable<TdpWidgetConfigMap[T]>;
}

export function sanitizeTdpWidgetIds(widgetIds: string[]): TdpWidgetId[] {
  return widgetIds.filter((widgetId): widgetId is TdpWidgetId =>
    TDP_WIDGET_IDS.includes(widgetId as TdpWidgetId),
  );
}

export function normalizeTdpWidgetConfigMap(
  widgetConfigs: Partial<TdpWidgetConfigMap> | null | undefined,
): TdpWidgetConfigMap {
  const normalized = {} as Record<TdpWidgetId, unknown>;

  for (const widgetId of TDP_WIDGET_IDS) {
    normalized[widgetId] = {
      ...createDefaultTdpWidgetConfig(widgetId),
      ...(widgetConfigs?.[widgetId] ?? {}),
    };
  }

  return normalized as TdpWidgetConfigMap;
}
