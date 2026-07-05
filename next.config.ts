import type { NextConfig } from "next";

function getHostname(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = getHostname(process.env.NEXT_PUBLIC_SUPABASE_URL);
const r2Host = getHostname(process.env.R2_PUBLIC_BASE_URL);
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  ...(supabaseHost
    ? [
        {
          protocol: "https" as const,
          hostname: supabaseHost,
          pathname: "/**",
        },
      ]
    : []),
  ...(r2Host
    ? [
        {
          protocol: "https" as const,
          hostname: r2Host,
          pathname: "/**",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tdp.lopva.cl",
          },
        ],
        destination: "https://tdp.lopva.cl/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
