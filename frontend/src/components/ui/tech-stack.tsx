"use client";

import React from "react";

const stack = [
  "Muse Spark (Meta Model API)",
  "SAM 3.1",
  "PyProj",
  "Shapely",
  "FastAPI",
  "Next.js",
];

export function TechStack() {
  return (
    <section className="w-full border-y border-white/[0.08] bg-[#07080A] px-6 py-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-500">
        <span className="font-mono text-zinc-400">Stack et référentiels</span>
        {stack.map((item) => (
          <span key={item} className="font-mono">
            {item}
          </span>
        ))}
        <span className="text-zinc-600">Aucune affiliation officielle</span>
      </div>
    </section>
  );
}
