import { getStorageObject } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { key } = await params;
  const objectKey = key.map((segment) => decodeURIComponent(segment)).join("/");

  if (!objectKey.trim()) {
    return new Response("Not found", { status: 404 });
  }

  const object = await getStorageObject(objectKey);
  const body = object.Body;

  if (!body) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  if (object.ContentType) {
    headers.set("Content-Type", object.ContentType);
  }
  if (object.ContentLength) {
    headers.set("Content-Length", String(object.ContentLength));
  }
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(body as BodyInit, { headers });
}

export function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";
