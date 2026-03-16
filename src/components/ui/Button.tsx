'use client';

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary:
      "bg-sky-500 text-white shadow-lg shadow-sky-100 hover:bg-sky-600",
    secondary:
      "bg-white text-sky-600 border border-sky-100 hover:bg-sky-50 hover:border-sky-200",
    ghost:
      "bg-transparent text-slate-700 hover:bg-sky-50 hover:text-sky-700",
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3",
    md: "h-10 px-4",
    lg: "h-11 px-5 text-base",
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}

