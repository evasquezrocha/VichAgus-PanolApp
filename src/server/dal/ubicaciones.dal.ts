import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCompanyAdmin, requireCurrentProfile } from "@/server/auth/guards";
import type { PanolLocation, LocationUserSummary } from "@/types/ubicaciones";

function normalizeLocationName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isPanolLocationName(value: string) {
  return stripAccents(normalizeLocationName(value)).toUpperCase() === "PANOL";
}

async function getCurrentCompanyIdForCurrentCompanyProfile() {
  const currentProfile = await requireCurrentProfile();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

async function getCurrentCompanyIdForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

async function listLocationUsersByCompanyId(companyId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return new Map<string, LocationUserSummary>(
    (data ?? []).map((user) => [
      user.id,
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    ]),
  );
}

export async function listPanolLocationsForCurrentCompanyAdmin(): Promise<PanolLocation[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyProfile();
  const supabase = await createServerSupabaseClient();

  const [locationsResult, usersById] = await Promise.all([
    supabase
      .from("panol_locations")
      .select("*")
      .eq("company_id", companyId)
      .order("is_default", { ascending: false })
      .order("nombre", { ascending: true }),
    listLocationUsersByCompanyId(companyId),
  ]);

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  return (locationsResult.data ?? []).map((location) => ({
    ...(location as PanolLocation),
    responsible_user: location.responsible_user_id
      ? usersById.get(location.responsible_user_id) ?? null
      : null,
  }));
}

export async function getDefaultPanolLocationForCurrentCompanyAdmin(): Promise<PanolLocation> {
  const locations = await listPanolLocationsForCurrentCompanyAdmin();
  const location =
    locations.find((item) => item.is_default) ??
    locations.find((item) => isPanolLocationName(item.nombre));

  if (!location) {
    throw new Error("Default location PAÑOL could not be resolved.");
  }

  return location;
}

export async function createPanolLocationForCurrentCompanyAdmin(input: {
  nombre: string;
  responsible_user_id: string | null;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const name = normalizeLocationName(input.nombre);
  const supabase = await createServerSupabaseClient();

  if (!name) {
    throw new Error("Location name is required.");
  }

  if (isPanolLocationName(name)) {
    const defaultLocation = await getDefaultPanolLocationForCurrentCompanyAdmin();
    const { data, error } = await supabase
      .from("panol_locations")
      .update({
        responsible_user_id: input.responsible_user_id,
      })
      .eq("id", defaultLocation.id)
      .eq("company_id", companyId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo actualizar la ubicación PAÑOL.");
    }

    return data as PanolLocation;
  }

  const { data, error } = await supabase
    .from("panol_locations")
    .insert({
      company_id: companyId,
      nombre: name,
      responsible_user_id: input.responsible_user_id,
      is_default: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la ubicación.");
  }

  return data as PanolLocation;
}

export async function updatePanolLocationForCurrentCompanyAdmin(input: {
  id: string;
  nombre: string;
  responsible_user_id: string | null;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const name = normalizeLocationName(input.nombre);
  const supabase = await createServerSupabaseClient();

  const { data: currentLocation, error: fetchError } = await supabase
    .from("panol_locations")
    .select("id, is_default")
    .eq("id", input.id)
    .eq("company_id", companyId)
    .single();

  if (fetchError || !currentLocation) {
    throw new Error(fetchError?.message ?? "Location not found.");
  }

  const payload: Record<string, string | boolean | null> = {
    responsible_user_id: input.responsible_user_id,
  };

  if (!currentLocation.is_default) {
    payload.nombre = name;
  }

  const { data, error } = await supabase
    .from("panol_locations")
    .update(payload as never)
    .eq("id", input.id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar la ubicación.");
  }

  return data as PanolLocation;
}
