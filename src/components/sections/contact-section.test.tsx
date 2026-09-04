import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ContactSection } from "./contact-section";

test("keeps contact controls visibly labelled and configured for autofill", () => {
  render(<ContactSection />);
  expect(screen.getByLabelText("Name")).toHaveAttribute("autocomplete", "name");
  expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  expect(screen.getByLabelText("How can we help?")).toBeRequired();
  expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute(
    "type",
    "button",
  );
});
