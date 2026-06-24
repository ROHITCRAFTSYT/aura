"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "soft" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:brightness-105 active:brightness-95 shadow-soft",
  soft: "bg-brand-soft text-brand hover:brightness-[0.98]",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-2",
  outline:
    "bg-surface text-ink border border-border hover:border-brand hover:text-brand",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-xl gap-1.5",
  md: "text-[0.95rem] px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-2xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
