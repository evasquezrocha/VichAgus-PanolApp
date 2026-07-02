export type SiteVariant = "app" | "tdp";

export type SiteConfig = {
  variant: SiteVariant;
  brandName: string;
  brandTagline: string;
  siteTitle: string;
  siteDescription: string;
  home: {
    badge: string;
    headline: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  login: {
    title: string;
    description: string;
    helperTitle: string;
    helperDescription: string;
  };
  assets: {
    logoHeader: string;
    logoCompact: string;
    symbol: string;
  };
};

const variant = (process.env.NEXT_PUBLIC_SITE_VARIANT as SiteVariant | undefined) ?? "app";

export function isTdpSite() {
  return variant === "tdp";
}

export function getDefaultDashboardPath() {
  return isTdpSite() ? "/tdp/panel" : "/panel";
}

export function getLoginPath() {
  return "/login";
}

function normalizeCanonicalUrl(value: string, fallback: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getTdpPublicProfileBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_TDP_PUBLIC_URL?.trim();
  if (!configuredUrl) {
    return "https://tdp.lopva.cl";
  }

  return normalizeCanonicalUrl(configuredUrl, "https://tdp.lopva.cl");
}

function envAsset(key: string, fallback: string) {
  const value = process.env[key]?.trim();
  return value ? value : fallback;
}

const sharedAssets = {
  logoHeader: envAsset("NEXT_PUBLIC_BRAND_LOGO_HEADER", "/brand/lopva_logo_posterior.png"),
  logoCompact: envAsset("NEXT_PUBLIC_BRAND_LOGO_COMPACT", "/brand/lopva_logo_primary.svg"),
  symbol: envAsset("NEXT_PUBLIC_BRAND_SYMBOL", "/brand/lopva_symbol_hex_transparent.svg"),
};

const appConfig: SiteConfig = {
  variant: "app",
  brandName: "Lopva",
  brandTagline: "Gestión operativa multiempresa",
  siteTitle: "Lopva | Gestión operativa multiempresa",
  siteDescription: "Plataforma para inventario, activos, trazabilidad y control multiempresa.",
  home: {
    badge: "Soluciones de software",
    headline: "Gestiona tu operación con una plataforma clara, rápida y lista para crecer.",
    description:
      "Lopva organiza activos, herramientas, usuarios y trazabilidad en un entorno multiempresa pensado para trabajo real. Una primera vista más premium, más tecnológica y más cercana a la identidad real de la marca.",
    ctaPrimary: "Entrar a la plataforma",
    ctaSecondary: "Ver gestión",
  },
  login: {
    title: "Iniciar sesión",
    description:
      "Una sola puerta de entrada para gestionar empresas, roles, activos y trazabilidad con una interfaz clara y consistente.",
    helperTitle: "Acceso seguro",
    helperDescription: "Cada usuario entra a su contexto de trabajo sin mezclar datos.",
  },
  assets: sharedAssets,
};

const tdpConfig: SiteConfig = {
  variant: "tdp",
  brandName: "Lopva TDP",
  brandTagline: "Tarjeta Digital y Presentación",
  siteTitle: "Lopva TDP | Plataforma de configuración",
  siteDescription: "Plataforma para configuración TDP, branding, datos y administración independiente.",
  home: {
    badge: "Configuración TDP",
    headline: "Configura tu tarjeta digital y mantén TDP separado de la plataforma principal.",
    description:
      "TDP comparte el mismo lenguaje visual, pero usa su propia base de datos, variables y flujos de acceso para evitar cruces con la operación principal.",
    ctaPrimary: "Entrar a TDP",
    ctaSecondary: "Ver configuración",
  },
  login: {
    title: "Iniciar sesión en TDP",
    description: "Accede al sistema de gestión de tarjetas digitales",
    helperTitle: "Acceso TDP",
    helperDescription: "Sesión y datos separados de la plataforma principal.",
  },
  assets: {
    logoHeader: "/brand/lopva_logo_tdp_horizontal.png",
    logoCompact: "/brand/lopva_logo_tdp_horizontal.png",
    symbol: sharedAssets.symbol,
  },
};

export function getSiteConfig(): SiteConfig {
  return isTdpSite() ? tdpConfig : appConfig;
}
