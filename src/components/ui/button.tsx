import * as React from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "soft" | "danger";
  size?: "md" | "sm" | "icon";
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" &&
          "bg-[var(--brand-500)] text-white shadow-[0_8px_30px_-16px_var(--brand-700)] hover:bg-[var(--brand-600)] focus-visible:ring-[var(--brand-400)]",
        variant === "ghost" &&
          "border border-transparent bg-transparent text-[var(--text-primary)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-2)] focus-visible:ring-[var(--brand-300)]",
        variant === "soft" &&
          "border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] focus-visible:ring-[var(--brand-300)]",
        variant === "danger" &&
          "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-300",
        size === "md" && "h-10 px-4 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "size-9",
        className,
      )}
      {...props}
    />
  );
}
