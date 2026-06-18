import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type { ToolGroupInput, ToolInput } from "@/schemas/panol.schema";
import type { Tool, ToolGroup } from "@/types/panol";

export async function getCurrentCompanySlugForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("slug")
    .eq("id", currentProfile.company_id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Company slug could not be resolved.");
  }

  return data.slug as string;
}

export async function listToolGroupsForCurrentCompanyAdmin(): Promise<ToolGroup[]> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_groups")
    .select("*")
    .eq("company_id", currentProfile.company_id)
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ToolGroup[];
}

export async function createToolGroupForCurrentCompanyAdmin(
  input: ToolGroupInput,
): Promise<ToolGroup> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_groups")
    .insert({
      company_id: currentProfile.company_id,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el grupo.");
  }

  return data as ToolGroup;
}

export async function listToolsForCurrentCompanyAdmin(): Promise<Tool[]> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tools")
    .select("*")
    .eq("company_id", currentProfile.company_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Tool[];
}

export async function createToolForCurrentCompanyAdmin(
  input: ToolInput & { image_url: string | null; image_dropbox_path: string | null },
): Promise<Tool> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tools")
    .insert({
      company_id: currentProfile.company_id,
      tool_group_id: input.tool_group_id,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
      cantidad: input.cantidad,
      unidad: input.unidad.toUpperCase(),
      marca: input.marca?.trim() || null,
      modelo: input.modelo?.trim() || null,
      image_url: input.image_url,
      image_dropbox_path: input.image_dropbox_path,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la herramienta.");
  }

  return data as Tool;
}

export async function updateToolForCurrentCompanyAdmin(
  input: ToolInput & {
    id: string;
    image_url: string | null;
    image_dropbox_path: string | null;
  },
): Promise<Tool> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tools")
    .update({
      tool_group_id: input.tool_group_id,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
      cantidad: input.cantidad,
      unidad: input.unidad.toUpperCase(),
      marca: input.marca?.trim() || null,
      modelo: input.modelo?.trim() || null,
      image_url: input.image_url,
      image_dropbox_path: input.image_dropbox_path,
    })
    .eq("id", input.id)
    .eq("company_id", currentProfile.company_id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar la herramienta.");
  }

  return data as Tool;
}

export async function deleteToolForCurrentCompanyAdmin(id: string) {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("tools")
    .delete()
    .eq("id", id)
    .eq("company_id", currentProfile.company_id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
