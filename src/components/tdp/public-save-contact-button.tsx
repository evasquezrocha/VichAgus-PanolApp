"use client";

type PublicSaveContactButtonProps = {
  fullName: string;
  companyName: string;
  title: string;
  photoUrl: string | null;
  phones: Array<{ value: string; types: string[] }>;
  emails: string[];
  urls: string[];
  address: string;
  backgroundColor: string;
};

function escapeVCardValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function normalizeUrl(url: string) {
  const value = url.trim();
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function downloadTextFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function buildVCard({
  fullName,
  companyName,
  title,
  photoUrl,
  phones,
  emails,
  urls,
  address,
}: Omit<PublicSaveContactButtonProps, "backgroundColor">) {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${escapeVCardValue(fullName)};;;`,
    `FN:${escapeVCardValue(fullName)}`,
  ];

  if (companyName.trim()) {
    lines.push(`ORG:${escapeVCardValue(companyName)}`);
  }

  if (title.trim()) {
    lines.push(`TITLE:${escapeVCardValue(title)}`);
  }

  if (photoUrl) {
    lines.push(`PHOTO;VALUE=URI:${escapeVCardValue(photoUrl)}`);
  }

  for (const phone of phones) {
    if (phone.value.trim()) {
      lines.push(`TEL;TYPE=${phone.types.join(",")}:${escapeVCardValue(phone.value)}`);
    }
  }

  for (const email of emails) {
    if (email.trim()) {
      lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
    }
  }

  for (const url of urls) {
    const normalizedUrl = normalizeUrl(url);
    if (normalizedUrl) {
      lines.push(`URL:${escapeVCardValue(normalizedUrl)}`);
    }
  }

  if (address.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(address)};;;;`);
    lines.push(`LABEL;TYPE=WORK:${escapeVCardValue(address)}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function PublicSaveContactButton(props: PublicSaveContactButtonProps) {
  const {
    fullName,
    companyName,
    title,
    photoUrl,
    phones,
    emails,
    urls,
    address,
    backgroundColor,
  } = props;

  return (
    <button
      type="button"
      onClick={() => {
        const vCard = buildVCard({
          fullName,
          companyName,
          title,
          photoUrl,
          phones,
          emails,
          urls,
          address,
        });

        const fileName = `${fullName || "contacto"}.vcf`
          .trim()
          .replace(/[^\w\d.-]+/g, "_");

        downloadTextFile(vCard, fileName);
      }}
      className="mt-6 inline-flex min-w-[185px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_14px_24px_rgba(73,112,236,0.3)] transition"
      style={{ backgroundColor }}
    >
      Guardar contacto
    </button>
  );
}
