import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
