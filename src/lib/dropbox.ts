import "server-only";

import { getRequiredEnv } from "@/lib/env";
import { randomUUID } from "node:crypto";

const DROPBOX_API_BASE = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_BASE = "https://content.dropboxapi.com/2";
const DROPBOX_OAUTH_TOKEN_URL = "https://api.dropbox.com/oauth2/token";

let cachedAccessToken: { value: string; expiresAt: number } | null = null;

function normalizeDropboxPath(path: string) {
  const trimmed = path.trim().replace(/\/+/g, "/");

  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }

  return trimmed;
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
}

function buildDropboxPath(folderPath: string, fileName: string) {
  const safeFolder = normalizeDropboxPath(folderPath).replace(/\/$/, "");
  const safeFileName = sanitizeFileName(fileName) || `${randomUUID()}.bin`;
  return `${safeFolder}/${randomUUID()}-${safeFileName}`;
}

async function parseDropboxError(response: Response) {
  const rawText = await response.text();

  try {
    const payload = JSON.parse(rawText) as {
      error_summary?: string;
      error?: { ".tag"?: string };
    };

    return payload.error_summary ?? payload.error?.[".tag"] ?? response.statusText;
  } catch {
    return rawText.trim() || response.statusText;
  }
}

async function getDropboxAccessToken() {
  const now = Date.now();

  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.value;
  }

  const appKey = getRequiredEnv("DROPBOX_APP_KEY");
  const appSecret = getRequiredEnv("DROPBOX_APP_SECRET");
  const refreshToken = getRequiredEnv("DROPBOX_REFRESH_TOKEN");

  const response = await fetch(DROPBOX_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Dropbox token refresh failed: ${await parseDropboxError(response)}`,
    );
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error("Dropbox did not return an access token.");
  }

  cachedAccessToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 14_400) * 1000,
  };

  return data.access_token;
}

async function ensureDropboxFolderExists(folderPath: string) {
  const accessToken = await getDropboxAccessToken();
  const normalizedPath = normalizeDropboxPath(folderPath).replace(/\/$/, "");
  const segments = normalizedPath.split("/").filter(Boolean);

  let currentPath = "";

  for (const segment of segments) {
    currentPath = `${currentPath}/${segment}`;

    const response = await fetch(`${DROPBOX_API_BASE}/files/create_folder_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: currentPath,
        autorename: false,
      }),
    });

    if (response.ok) {
      continue;
    }

    const errorSummary = await parseDropboxError(response);

    if (
      response.status === 409 &&
      (errorSummary.includes("path/conflict/folder") ||
        errorSummary.includes("path/conflict/file"))
    ) {
      continue;
    }

    throw new Error(`Dropbox folder create failed: ${errorSummary}`);
  }
}

export async function uploadFileToDropbox(file: File, folderPath: string) {
  const accessToken = await getDropboxAccessToken();
  const dropboxPath = buildDropboxPath(folderPath, file.name);
  const body = Buffer.from(await file.arrayBuffer());

  await ensureDropboxFolderExists(folderPath);

  const uploadResponse = await fetch(`${DROPBOX_CONTENT_BASE}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: dropboxPath,
        mode: "add",
        autorename: true,
        mute: false,
        strict_conflict: false,
      }),
    },
    body,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Dropbox upload failed: ${await parseDropboxError(uploadResponse)}`,
    );
  }

  const metadata = (await uploadResponse.json()) as {
    path_display?: string;
    path_lower?: string;
  };
  const savedPath = metadata.path_display ?? metadata.path_lower ?? dropboxPath;
  const sharedUrl = await createDropboxSharedLink(savedPath);

  return {
    path: savedPath,
    url: sharedUrl,
  };
}

async function createDropboxSharedLink(path: string) {
  const accessToken = await getDropboxAccessToken();
  const response = await fetch(
    `${DROPBOX_API_BASE}/sharing/create_shared_link_with_settings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    },
  );

  if (response.ok) {
    const data = (await response.json()) as { url?: string };
    return data.url ? toRawDropboxUrl(data.url) : null;
  }

  const payload = await parseDropboxError(response);

  if (payload.includes("shared_link_already_exists")) {
    const existing = await fetchExistingDropboxSharedLink(path);
    return existing;
  }

  return null;
}

async function fetchExistingDropboxSharedLink(path: string) {
  const accessToken = await getDropboxAccessToken();
  const response = await fetch(`${DROPBOX_API_BASE}/sharing/list_shared_links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      direct_only: true,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { links?: Array<{ url?: string }> };
  const url = data.links?.[0]?.url ?? null;
  return url ? toRawDropboxUrl(url) : null;
}

function toRawDropboxUrl(url: string) {
  if (url.includes("raw=1")) {
    return url;
  }

  return url.includes("?") ? `${url}&raw=1` : `${url}?raw=1`;
}
