import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { OperationsDashboard } from "./operations-dashboard";

test("lets the driver report and undo a container status", () => {
  render(<OperationsDashboard />);

  fireEvent.click(screen.getByRole("button", { name: /saturado/i }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Estado reportado: Saturado",
  );

  fireEvent.click(screen.getByRole("button", { name: "Deshacer" }));
  expect(
    screen.queryByText("Estado reportado: Saturado"),
  ).not.toBeInTheDocument();
});

test("shows and applies a suggested route change", () => {
  render(<OperationsDashboard />);

  fireEvent.click(screen.getByRole("button", { name: "Ver cambio" }));
  fireEvent.click(screen.getByRole("button", { name: /aplicar desvío/i }));

  expect(screen.getByRole("status")).toHaveTextContent("Desvío aplicado");
});
