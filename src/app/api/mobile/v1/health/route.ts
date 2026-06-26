export async function GET() {
  return Response.json({
    status: "ok",
    api: "mobile-v1",
    offline_sync: true,
  });
}

