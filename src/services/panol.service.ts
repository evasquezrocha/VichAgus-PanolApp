import "server-only";

import {
  createToolCustomFieldForCurrentCompanyAdmin,
  createToolForCurrentCompanyAdmin,
  createToolGroupForCurrentCompanyAdmin,
  deleteToolForCurrentCompanyAdmin,
  deleteToolCustomFieldForCurrentCompanyAdmin,
  getCurrentCompanySlugForCurrentCompanyAdmin,
  getToolDetailForCurrentCompanyAdmin,
  listToolCustomFieldValuesForCurrentCompanyAdmin,
  listToolCustomFieldsForCurrentCompanyAdmin,
  listToolGroupsForCurrentCompanyAdmin,
  listToolsForCurrentCompanyAdmin,
  reorderToolCustomFieldForCurrentCompanyAdmin,
  replaceToolCustomFieldValuesForCurrentCompanyAdmin,
  updateToolCustomFieldForCurrentCompanyAdmin,
  updateToolForCurrentCompanyAdmin,
} from "@/server/dal/panol.dal";
import type {
  ToolCustomFieldInput,
  ToolGroupInput,
  ToolInput,
} from "@/schemas/panol.schema";
import { uploadFileToDropbox } from "@/lib/dropbox";

function getDropboxBaseFolder() {
  return (process.env.DROPBOX_BASE_FOLDER ?? "/PanolApp").replace(/\/$/, "");
}

async function getToolImagesFolder() {
  const companySlug = await getCurrentCompanySlugForCurrentCompanyAdmin();
  return `${getDropboxBaseFolder()}/${companySlug}/Herramientas`;
}

export async function listToolGroups() {
  return listToolGroupsForCurrentCompanyAdmin();
}

export async function listTools() {
  return listToolsForCurrentCompanyAdmin();
}

export async function getToolDetail(toolId: string) {
  return getToolDetailForCurrentCompanyAdmin(toolId);
}

export async function listToolCustomFields() {
  return listToolCustomFieldsForCurrentCompanyAdmin();
}

export async function listToolCustomFieldValues() {
  return listToolCustomFieldValuesForCurrentCompanyAdmin();
}

export async function createToolGroup(input: ToolGroupInput) {
  return createToolGroupForCurrentCompanyAdmin(input);
}

export async function createToolCustomField(input: ToolCustomFieldInput) {
  return createToolCustomFieldForCurrentCompanyAdmin(input);
}

export async function updateToolCustomField(
  input: ToolCustomFieldInput & { id: string },
) {
  return updateToolCustomFieldForCurrentCompanyAdmin(input);
}

export async function deleteToolCustomField(id: string) {
  return deleteToolCustomFieldForCurrentCompanyAdmin(id);
}

export async function reorderToolCustomField(
  id: string,
  direction: "up" | "down",
) {
  return reorderToolCustomFieldForCurrentCompanyAdmin(id, direction);
}

export async function createTool(
  input: ToolInput,
  customFieldValues: Record<string, string | null>,
  imageFile?: File | null,
) {
  let imageUrl: string | null = null;
  let imageDropboxPath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToDropbox(imageFile, await getToolImagesFolder());
    imageUrl = uploaded.url;
    imageDropboxPath = uploaded.path;
  }

  return createToolForCurrentCompanyAdmin({
    ...input,
    estado: input.estado,
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
  }).then(async (tool) => {
    await replaceToolCustomFieldValuesForCurrentCompanyAdmin(
      tool.id,
      customFieldValues,
    );
    return tool;
  });
}

export async function updateTool(
  input: ToolInput & {
    id: string;
    image_url: string | null;
    image_dropbox_path: string | null;
  },
  customFieldValues: Record<string, string | null>,
  imageFile?: File | null,
) {
  let imageUrl = input.image_url;
  let imageDropboxPath = input.image_dropbox_path;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToDropbox(imageFile, await getToolImagesFolder());
    imageUrl = uploaded.url;
    imageDropboxPath = uploaded.path;
  }

  return updateToolForCurrentCompanyAdmin({
    ...input,
    estado: input.estado,
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
  }).then(async (tool) => {
    await replaceToolCustomFieldValuesForCurrentCompanyAdmin(
      tool.id,
      customFieldValues,
    );
    return tool;
  });
}

export async function deleteTool(id: string) {
  return deleteToolForCurrentCompanyAdmin(id);
}
