"use client";

import React from "react";
import {
  Home,
  Map as MapIcon,
  Crosshair,
  FileText,
  Database,
  Activity,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  recordCount?: number;
  onTabChange: (tab: string) => void;
  onOpenApiSettings: () => void;
}

export default function Sidebar({
  activeTab,
  recordCount = 0,
  onTabChange,
  onOpenApiSettings,
}: SidebarProps) {
  const menuItems = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "carte", label: "Carte", icon: MapIcon },
    { id: "investigations", label: "Investigations", icon: Crosshair },
    { id: "rapports", label: "Rapports", icon: FileText },
    { id: "donnees", label: "Données", icon: Database },
    { id: "ia", label: "IA & Analyses", icon: Activity },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-16 lg:w-48 shrink-0 bg-[#040711] border-r border-white/[0.08] flex flex-col justify-between py-4 px-2 select-none font-sans">
      {/* Navigation Links */}
      <nav className="space-y-1" aria-label="Navigation principale">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showCount =
            recordCount > 0 && (item.id === "investigations" || item.id === "rapports");

          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                if (item.id === "parametres") {
                  onOpenApiSettings();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 ${
                isActive
                  ? "bg-[#3B82F6]/15 text-[#93C5FD] font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#60A5FA]" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? "text-[#60A5FA]" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <span className="hidden lg:inline tracking-tight">{item.label}</span>

              {/* Count badge: visible as a dot on the collapsed rail */}
              {showCount && (
                <span
                  className={`ml-auto hidden lg:inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[9px] ${
                    isActive
                      ? "bg-[#3B82F6]/25 text-[#93C5FD]"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {recordCount}
                </span>
              )}
              {showCount && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#60A5FA] lg:hidden" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Geodetic Engine Signature */}
      <div className="hidden lg:block px-3 py-2 text-[10px] text-zinc-500 font-mono">
        <p className="font-semibold text-zinc-400 uppercase tracking-wide">CADASTRA · CM</p>
        <p className="text-zinc-500">Moteur géodésique WGS84</p>
        <p className="mt-1 text-zinc-600">v1.0 · HACKATHON 2026</p>
      </div>
    </aside>
  );
}
