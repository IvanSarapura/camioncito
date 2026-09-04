import type { NextConfig } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (process.env.VERCEL_ENV === "production") {
  if (!configuredSiteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set to the HTTPS canonical URL for Vercel production builds.",
    );
  }

  let parsedSiteUrl: URL;

  try {
    parsedSiteUrl = new URL(configuredSiteUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a valid HTTPS URL for Vercel production builds.",
    );
  }

  const isHttpsOrigin =
    parsedSiteUrl.protocol === "https:" &&
    parsedSiteUrl.pathname === "/" &&
    !parsedSiteUrl.href.includes("?") &&
    !parsedSiteUrl.href.includes("#") &&
    !parsedSiteUrl.username &&
    !parsedSiteUrl.password;

  if (!isHttpsOrigin) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTPS origin without a path, query, hash, or credentials for Vercel production builds.",
    );
  }
}

const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: false,
  },
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
