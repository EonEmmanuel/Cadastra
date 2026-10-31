"use client";

import React from "react";
import {
  Home,
  Map as MapIcon,
  Crosshair,
  FileText,
  Database,
  Sparkles,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenApiSettings: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onOpenApiSettings,
}: SidebarProps) {
  const menuItems = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "carte", label: "Carte", icon: MapIcon },
    { id: "investigations", label: "Investigations", icon: Crosshair },
    { id: "rapports", label: "Rapports", icon: FileText },
    { id: "donnees", label: "Données", icon: Database },
    { id: "ia", label: "IA & Analyses", icon: Sparkles },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-16 lg:w-48 shrink-0 bg-[#07090D] flex flex-col justify-between py-4 px-2 select-none">
      {/* Navigation Links */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "parametres") {
                  onOpenApiSettings();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#00DF8F]/15 text-[#00DF8F] font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? "text-[#00DF8F]" : "text-zinc-400"
                }`}
              />
              <span className="hidden lg:inline tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Cameroon Geodetic Authority Signature */}
      <div className="hidden lg:block px-3 py-2 text-[10px] text-zinc-600 font-mono">
        <p className="font-semibold text-zinc-500">MINDCAF · CM</p>
        <p>Norme Décret 76-165</p>
      </div>
    </aside>
  );
}
