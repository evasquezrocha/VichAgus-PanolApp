import { buildFlashPath } from "@/lib/flash";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createSupabaseAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (!profile) {
          await supabase.auth.signOut();

          return NextResponse.redirect(
            new URL(
              buildFlashPath(
                "/login",
                "error",
                "Tu usuario no tiene perfil asignado. Contacta a un administrador.",
              ),
              request.url,
            ),
          );
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
