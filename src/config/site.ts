export const siteConfig = {
  name: "Your Studio",
  description:
    "A concise description of the work your website helps people accomplish.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@example.com",
  navigation: [
    { href: "#features", label: "Features" },
    { href: "#contact", label: "Contact" },
  ],
} as const;
