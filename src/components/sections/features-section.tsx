import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";

const features = [
  [
    "Fast by default",
    "Server-rendered pages and a deliberately small client surface keep the starter lean.",
  ],
  [
    "Ready to be found",
    "Metadata, robots, sitemap, and a web manifest are part of the foundation.",
  ],
  [
    "Safe to evolve",
    "A focused CI flow catches formatting, types, unit contracts, builds, and a real browser smoke test.",
  ],
] as const;

export function FeaturesSection() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <Container>
        <p className="eyebrow">The baseline</p>
        <h2 className="section-heading" id="features-title">
          Enough structure to move quickly.
        </h2>
        <p className="section-intro">
          Keep only the tools that prevent costly mistakes on small professional
          websites.
        </p>
        <div className="feature-grid">
          {features.map(([title, description]) => (
            <Card key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
