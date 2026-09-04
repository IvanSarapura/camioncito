import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <Container className="contact-layout">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="section-heading" id="contact-title">
            A form pattern, ready for your integration.
          </h2>
          <p className="contact-note">
            This starter intentionally has no data endpoint. Connect a provider
            or a server action when the project requires one.
          </p>
        </div>
        <form className="contact-form" aria-describedby="contact-form-note">
          <p className="field-hint" id="contact-form-note">
            Template fields only — submissions are not enabled.
          </p>
          <div className="field">
            <label htmlFor="name">Name</label>
            <Input autoComplete="name" id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>
          <div className="field">
            <label htmlFor="message">How can we help?</label>
            <Textarea id="message" name="message" required />
          </div>
          <Button aria-describedby="contact-form-note">Send message</Button>
        </form>
      </Container>
    </section>
  );
}
