import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"article">) {
  return <article className={`card ${className}`.trim()} {...props} />;
}
