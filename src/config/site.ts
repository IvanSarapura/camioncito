const localSiteUrl = "http://localhost:3000";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = configuredSiteUrl
  ? configuredSiteUrl.replace(/\/+$/, "")
  : localSiteUrl;

export const siteConfig = {
  name: "Your Studio",
  description:
    "A concise description of the work your website helps people accomplish.",
  url: siteUrl,
  locale: "en",
  email: "hello@example.com",
  navigation: [
    { href: "#features", label: "Features" },
    { href: "#contact", label: "Contact" },
  ],
} as const;
