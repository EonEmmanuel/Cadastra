"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Cadastra] Unhandled UI error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060709] px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#090B10] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/[0.08]">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Incident d&apos;interface
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
          Une vue n&apos;a pas pu être rendue
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-400">
          Le calcul géodésique reste intact : seuls les composants de cette page
          ont échoué. Réessayez, ou revenez à l&apos;accueil pour charger un
          nouveau plan.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-zinc-600">
            Référence : {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
