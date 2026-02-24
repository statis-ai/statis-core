"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "default" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-brand-accent text-brand-statist hover:shadow-glow active:scale-[0.98]",
          variant === "ghost" &&
            "glass-card hover:border-brand-accent/30 active:scale-[0.98]",
          size === "default" && "px-6 py-3 text-sm",
          size === "lg" && "px-8 py-4 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
export { Button };
