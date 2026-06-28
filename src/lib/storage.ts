import "server-only";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { getRequiredEnv } from "@/lib/env";

type UploadResult = {
  path: string;
  url: string | null;
};

let r2Client: S3Client | null = null;

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
}

function normalizeFolderPath(folderPath: string) {
  return folderPath.trim().replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
}

function buildStoragePath(folderPath: string, fileName: string) {
  const folder = normalizeFolderPath(folderPath);
  const safeFileName = sanitizeFileName(fileName) || `${randomUUID()}.bin`;
  const key = `${randomUUID()}-${safeFileName}`;

  return folder ? `${folder}/${key}` : key;
}

function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_BASE_URL,
  );
}

function assertR2Configured() {
  if (!isR2Configured()) {
    throw new Error(
      "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_PUBLIC_BASE_URL.",
    );
  }
}

function getR2Client() {
  if (!r2Client) {
    const accountId = getRequiredEnv("R2_ACCOUNT_ID");
    const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  return r2Client;
}

function buildR2PublicUrl(objectKey: string) {
  const baseUrl = new URL(getRequiredEnv("R2_PUBLIC_BASE_URL"));
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const basePath = baseUrl.pathname.replace(/\/$/, "");
  baseUrl.pathname = `${basePath}/${encodedKey}`.replace(/\/+/g, "/");

  return baseUrl.toString();
}

async function uploadFileToR2(file: File, folderPath: string): Promise<UploadResult> {
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");
  const objectKey = buildStoragePath(folderPath, file.name);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    path: objectKey,
    url: buildR2PublicUrl(objectKey),
  };
}

export async function uploadFileToStorage(file: File, folderPath: string) {
  assertR2Configured();
  return uploadFileToR2(file, folderPath);
}

export async function deleteFileFromStorage(objectKey: string) {
  assertR2Configured();

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET_NAME"),
      Key: objectKey,
    }),
  );
}
