import { ZodError } from "zod";
import { randomUUID } from "crypto";

export type FlashIntent = "success" | "error";

type SearchParamValue = string | string[] | undefined;

export type FlashMessage = {
  flashId: string;
  intent: FlashIntent;
  message: string;
};

function takeFirstValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function buildFlashPath(
  path: string,
  intent: FlashIntent,
  message: string,
) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("status", intent);
  params.set("message", message);
  params.set("flash_id", randomUUID());

  return `${pathname}?${params.toString()}`;
}

export function getActionErrorMessage(
  error: unknown,
  fallback = "No se pudo completar la operacion.",
) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function getFlashMessage(
  searchParams?: Promise<Record<string, SearchParamValue>>,
): Promise<FlashMessage | null> {
  if (!searchParams) {
    return null;
  }

  const params = await searchParams;
  const intent = takeFirstValue(params.status);
  const message = takeFirstValue(params.message);
  const flashId = takeFirstValue(params.flash_id) ?? randomUUID();

  if (
    (intent !== "success" && intent !== "error") ||
    !message ||
    message.trim().length === 0
  ) {
    return null;
  }

  return {
    flashId,
    intent,
    message,
  };
}
