import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        © {new Date().getFullYear()} {siteConfig.name}. Replace this starter
        content with your own.
      </Container>
    </footer>
  );
}
