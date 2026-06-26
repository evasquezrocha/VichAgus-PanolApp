import { mobileSyncPushSchema } from "@panol/shared";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = mobileSyncPushSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid sync payload.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  return Response.json(
    {
      status: "scaffolded",
      message:
        "Mobile sync contract is ready, but server-side conflict resolution is not implemented yet.",
      received_mutations: parsed.data.mutations.length,
      device_id: parsed.data.device_id,
      base_revision: parsed.data.base_revision,
    },
    { status: 501 },
  );
}
