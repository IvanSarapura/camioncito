import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container className="header-inner">
        <Link className="brand" href="/">
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
