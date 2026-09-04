import { Container } from "@/components/layout/container";

export function HeroSection() {
  return (
    <section className="hero">
      <Container>
        <p className="eyebrow">A professional starting point</p>
        <h1>Build a focused website without rebuilding the foundations.</h1>
        <p className="hero-copy">
          Replace the copy, connect the services your project needs, and keep a
          dependable path from local work to production.
        </p>
        <a className="button button-primary" href="#contact">
          Start your project
        </a>
      </Container>
    </section>
  );
}
