import type { ComponentProps } from "react";

export function Textarea({
  className = "",
  ...props
}: ComponentProps<"textarea">) {
  return <textarea className={`textarea ${className}`.trim()} {...props} />;
}
