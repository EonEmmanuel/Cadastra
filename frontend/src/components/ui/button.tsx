"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "circle";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      // Solid pure white with top specular edge (Exact Vocel primary button)
      primary:
        "bg-white hover:bg-zinc-100 text-[#07080A] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,1),_0_2px_8px_0_rgba(0,0,0,0.4)] border border-transparent active:scale-[0.98]",
      // Frosted dark glass with hairline border
      secondary:
        "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md active:scale-[0.98]",
      // Subtle hairline outline
      outline:
        "bg-transparent hover:bg-white/[0.04] text-zinc-300 border border-white/[0.12] hover:border-white/25 active:scale-[0.98]",
      // Minimal ghost
      ghost:
        "bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-white",
      // Circular action trigger (Exact Vocel play button)
      circle:
        "rounded-full bg-white hover:bg-zinc-100 text-black shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] active:scale-95",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-9 px-4 text-xs rounded-lg gap-2",
      lg: "h-11 px-6 text-sm rounded-lg gap-2.5 font-semibold",
      icon: "w-10 h-10 rounded-full p-0 flex items-center justify-center",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant === "circle" ? sizeStyles.icon : sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
