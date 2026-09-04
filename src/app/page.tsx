import { ContactSection } from "@/components/sections/contact-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        <HeroSection />
        <FeaturesSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
