import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="section">
      <p className="eyebrow">404</p>
      <h1 className="section-heading">This page does not exist.</h1>
      <p className="hero-copy">Check the address or return to the homepage.</p>
      <Link className="button button-primary" href="/">
        Go home
      </Link>
    </Container>
  );
}
