"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning" | "outline";
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-white/[0.05] text-zinc-300 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    success:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    danger:
      "bg-red-500/10 text-red-300 border border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    warning:
      "bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    outline:
      "bg-transparent text-zinc-400 border border-white/[0.12]",
  };

  const dotColors = {
    default: "bg-zinc-400",
    success: "bg-[#00DF8F]",
    danger: "bg-red-400",
    warning: "bg-amber-400",
    outline: "bg-zinc-500",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide select-none backdrop-blur-md",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColors[variant]
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            dotColors[variant]
          )}
        />
      </span>
      <span>{children}</span>
    </div>
  );
}
