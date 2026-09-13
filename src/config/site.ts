const localSiteUrl = "http://localhost:3000";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = configuredSiteUrl
  ? configuredSiteUrl.replace(/\/+$/, "")
  : localSiteUrl;

export const siteConfig = {
  name: "Rumbo",
  description:
    "Trazabilidad operativa y sugerencias de recorrido para la recolección urbana.",
  url: siteUrl,
  locale: "es-AR",
  email: "operaciones@rumbo.ar",
  navigation: [
    { href: "#operacion", label: "Operación" },
    { href: "#flota", label: "Flota" },
  ],
} as const;
