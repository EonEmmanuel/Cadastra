"use client";

import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          {eyebrow}
        </span>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  footnote?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  footnote,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <Icon className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      {footnote && (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          {footnote}
        </p>
      )}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "success" | "danger" | "warning";
}

export function StatTile({ label, value, detail, tone = "neutral" }: StatTileProps) {
  const toneClass = {
    neutral: "text-white",
    success: "text-emerald-400",
    danger: "text-red-400",
    warning: "text-amber-400",
  }[tone];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <div className={`mt-1.5 font-mono text-xl font-bold tracking-tight ${toneClass}`}>
        {value}
      </div>
      {detail && <p className="mt-0.5 text-[10px] text-zinc-500">{detail}</p>}
    </div>
  );
}

interface RowActionProps {
  onClick: () => void;
  label: string;
}

export function RowAction({ onClick, label }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
    >
      {label}
      <ArrowUpRight className="h-3 w-3" />
    </button>
  );
}
