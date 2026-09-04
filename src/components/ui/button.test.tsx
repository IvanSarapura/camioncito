import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./button";

test("uses a safe button type by default", () => {
  render(<Button>Save</Button>);
  expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
    "type",
    "button",
  );
});
