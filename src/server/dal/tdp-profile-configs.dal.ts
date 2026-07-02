import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_TDP_PROFILE_CONFIG,
  normalizeTdpWidgetConfigMap,
  type TdpProfileConfig,
  type TdpWidgetId,
  sanitizeTdpWidgetIds,
} from "@/types/tdp-profile";
import { randomBytes } from "node:crypto";

type TdpProfileConfigRow = {
  user_id: string;
  profile_code: string;
  full_name: string;
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
  widget_ids: string[];
  widget_configs: Record<string, unknown> | null;
};

function mapRowToConfig(row: TdpProfileConfigRow | null): TdpProfileConfig {
  if (!row) {
    return {
      ...DEFAULT_TDP_PROFILE_CONFIG,
      widget_configs: normalizeTdpWidgetConfigMap(null),
    };
  }

  return {
    profile_code: row.profile_code ?? "",
    full_name: row.full_name ?? "",
    description: row.description ?? "",
    background_1: row.background_1 ?? DEFAULT_TDP_PROFILE_CONFIG.background_1,
    use_second_background:
      row.use_second_background ?? DEFAULT_TDP_PROFILE_CONFIG.use_second_background,
    background_2: row.background_2 ?? DEFAULT_TDP_PROFILE_CONFIG.background_2,
    text_color: row.text_color ?? DEFAULT_TDP_PROFILE_CONFIG.text_color,
    main_button_color:
      row.main_button_color ?? DEFAULT_TDP_PROFILE_CONFIG.main_button_color,
    icon_color: row.icon_color ?? DEFAULT_TDP_PROFILE_CONFIG.icon_color,
    widget_button_bg:
      row.widget_button_bg ?? DEFAULT_TDP_PROFILE_CONFIG.widget_button_bg,
    widget_button_text:
      row.widget_button_text ?? DEFAULT_TDP_PROFILE_CONFIG.widget_button_text,
    widget_button_hover:
      row.widget_button_hover ?? DEFAULT_TDP_PROFILE_CONFIG.widget_button_hover,
    show_save_contact:
      row.show_save_contact ?? DEFAULT_TDP_PROFILE_CONFIG.show_save_contact,
    contact_title: row.contact_title ?? "",
    widget_ids: sanitizeTdpWidgetIds(row.widget_ids ?? []),
    widget_configs: normalizeTdpWidgetConfigMap(
      row.widget_configs && typeof row.widget_configs === "object"
        ? (row.widget_configs as TdpProfileConfig["widget_configs"])
        : null,
    ),
  };
}

function generateProfileCode() {
  return randomBytes(6).toString("hex");
}

async function ensureProfileCode(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  row: TdpProfileConfigRow,
) {
  if (row.profile_code.trim().length > 0) {
    return row.profile_code;
  }

  let profileCode = generateProfileCode();
  let attempts = 0;

  while (attempts < 5) {
    const { error } = await supabase
      .from("tdp_profile_configs")
      .update({ profile_code: profileCode })
      .eq("user_id", row.user_id);

    if (!error) {
      return profileCode;
    }

    if (!String(error.message).toLowerCase().includes("unique")) {
      throw new Error(error.message);
    }

    profileCode = generateProfileCode();
    attempts += 1;
  }

  throw new Error("No se pudo generar un código público para el perfil.");
}

export async function getTdpProfileConfig(
  userId: string,
): Promise<TdpProfileConfig> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tdp_profile_configs")
    .select(
      "user_id, profile_code, full_name, description, background_1, use_second_background, background_2, text_color, main_button_color, icon_color, widget_button_bg, widget_button_text, widget_button_hover, show_save_contact, contact_title, widget_ids, widget_configs",
    )
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return {
      ...DEFAULT_TDP_PROFILE_CONFIG,
      widget_configs: normalizeTdpWidgetConfigMap(null),
    };
  }

  const row = data as TdpProfileConfigRow;
  const profileCode = await ensureProfileCode(supabase, row);

  return mapRowToConfig({
    ...row,
    profile_code: profileCode,
  });
}

export async function saveTdpProfileConfig(
  userId: string,
  config: TdpProfileConfig,
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tdp_profile_configs").upsert({
    user_id: userId,
    profile_code: config.profile_code,
    full_name: config.full_name,
    description: config.description,
    background_1: config.background_1,
    use_second_background: config.use_second_background,
    background_2: config.background_2,
    text_color: config.text_color,
    main_button_color: config.main_button_color,
    icon_color: config.icon_color,
    widget_button_bg: config.widget_button_bg,
    widget_button_text: config.widget_button_text,
    widget_button_hover: config.widget_button_hover,
    show_save_contact: config.show_save_contact,
    contact_title: config.contact_title,
    widget_ids: sanitizeTdpWidgetIds(config.widget_ids),
    widget_configs: config.widget_configs,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTdpProfileByPublicCode(
  profileCode: string,
): Promise<TdpProfileConfig | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tdp_profile_configs")
    .select(
      "user_id, profile_code, full_name, description, background_1, use_second_background, background_2, text_color, main_button_color, icon_color, widget_button_bg, widget_button_text, widget_button_hover, show_save_contact, contact_title, widget_ids, widget_configs",
    )
    .eq("profile_code", profileCode)
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToConfig(data as TdpProfileConfigRow);
}
