import Link from "next/link";
import { Compass, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060709] px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#090B10] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Compass className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Erreur 404 · Hors périmètre
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
          Cette parcelle n&apos;existe pas
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-400">
          La page demandée ne figure pas dans le cadastre de l&apos;application.
          Retournez à l&apos;audit pour charger un plan ou explorer la carte.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            <MapPin className="h-3.5 w-3.5" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/?view=dashboard&tab=donnees"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Voir les jeux de données
          </Link>
        </div>
      </div>
    </main>
  );
}
