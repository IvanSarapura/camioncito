import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { OperationsDashboard } from "./operations-dashboard";

test("lets the driver report and undo a container status", () => {
  render(<OperationsDashboard />);

  fireEvent.click(screen.getByRole("button", { name: /saturado/i }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Estado reportado: Saturado",
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "Deshacer reporte de contenedor saturado",
    }),
  );
  expect(
    screen.queryByText("Estado reportado: Saturado"),
  ).not.toBeInTheDocument();
});

test("moves on after the five-second stop and clears the previous report", () => {
  vi.useFakeTimers();
  render(<OperationsDashboard />);

  fireEvent.click(screen.getByRole("button", { name: /^lleno$/i }));
  act(() => vi.advanceTimersByTime(8_000));

  expect(screen.queryByText("Estado reportado: Lleno")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^lleno$/i })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  vi.useRealTimers();
});

test("shows and applies a suggested route change", () => {
  render(<OperationsDashboard />);

  fireEvent.click(screen.getByRole("button", { name: "Ver alternativa" }));
  fireEvent.click(screen.getByRole("button", { name: /aplicar desvío/i }));

  expect(screen.getByRole("status")).toHaveTextContent("Desvío aplicado");
});

test("lets the driver adjust the simulated map zoom", () => {
  render(<OperationsDashboard />);

  const zoomIn = screen.getByRole("button", { name: "Acercar mapa" });
  const zoomOut = screen.getByRole("button", { name: "Alejar mapa" });

  expect(zoomOut).toBeEnabled();
  fireEvent.click(zoomOut);
  fireEvent.click(zoomOut);
  expect(zoomOut).toBeDisabled();
  fireEvent.click(zoomIn);
  expect(zoomOut).toBeEnabled();
});
