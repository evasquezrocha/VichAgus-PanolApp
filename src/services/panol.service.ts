import "server-only";

import {
  createToolForCurrentCompanyAdmin,
  createToolGroupForCurrentCompanyAdmin,
  deleteToolForCurrentCompanyAdmin,
  getCurrentCompanySlugForCurrentCompanyAdmin,
  listToolGroupsForCurrentCompanyAdmin,
  listToolsForCurrentCompanyAdmin,
  updateToolForCurrentCompanyAdmin,
} from "@/server/dal/panol.dal";
import type { ToolGroupInput, ToolInput } from "@/schemas/panol.schema";
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

export async function createToolGroup(input: ToolGroupInput) {
  return createToolGroupForCurrentCompanyAdmin(input);
}

export async function createTool(
  input: ToolInput,
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
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
  });
}

export async function updateTool(
  input: ToolInput & { id: string; image_url: string | null; image_dropbox_path: string | null },
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
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
  });
}

export async function deleteTool(id: string) {
  return deleteToolForCurrentCompanyAdmin(id);
}
