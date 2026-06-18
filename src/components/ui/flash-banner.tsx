import type { FlashMessage } from "@/lib/flash";

type FlashBannerProps = {
  flash: FlashMessage | null;
};

export function FlashBanner({ flash }: FlashBannerProps) {
  if (!flash) {
    return null;
  }

  const tone =
    flash.intent === "success"
      ? "border-[#52D6A4]/45 bg-[#52D6A4]/12 text-[#1d4335]"
      : "border-[#c86f5d]/35 bg-[#c86f5d]/10 text-[#7b3428]";

  return (
    <div
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${tone}`}
      role={flash.intent === "error" ? "alert" : "status"}
    >
      {flash.message}
    </div>
  );
}
