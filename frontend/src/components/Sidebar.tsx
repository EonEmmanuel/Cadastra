"use client";

import React, { useState } from "react";
import {
  Home,
  Map as MapIcon,
  Crosshair,
  FileText,
  Database,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  recordCount?: number;
  onTabChange: (tab: string) => void;
  onOpenApiSettings: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeTab,
  recordCount = 0,
  onTabChange,
  onOpenApiSettings,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

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
    <aside
      className={`h-full flex flex-col justify-between py-4 select-none font-sans rounded-[26px] bg-[#040711]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 ${
        isCollapsed ? "w-16 px-2.5 items-center" : "w-52 px-3"
      }`}
    >
      {/* Top Header: Brand Emblem & Collapse Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] w-full">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Geodetic Aperture Ring Logo */}
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-inner">
            <div className="w-5 h-5 rounded-full border-2 border-[#60A5FA] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#60A5FA]" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                CADASTRA
              </span>
              <span className="text-xs font-mono font-semibold text-[#60A5FA] tracking-wider">
                CM · WGS84
              </span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggle}
          title={isCollapsed ? "Développer le menu" : "Réduire le menu"}
          className={`h-7 w-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition ${
            isCollapsed ? "hidden" : "flex"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        className="space-y-1.5 flex-1 py-3 flex flex-col items-center w-full"
        aria-label="Navigation principale"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showCount =
            recordCount > 0 &&
            (item.id === "investigations" || item.id === "rapports");

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
              className={`group relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 ${
                isCollapsed
                  ? `w-11 h-11 justify-center ${
                      isActive
                        ? "bg-white text-black shadow-lg shadow-white/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`
                  : `w-full gap-3 px-3.5 py-2.5 ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? "text-black scale-105"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />

              {!isCollapsed && (
                <span className="tracking-tight truncate">{item.label}</span>
              )}

              {/* Count badge */}
              {showCount && !isCollapsed && (
                <span
                  className={`ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    isActive
                      ? "bg-black/10 text-black"
                      : "bg-white/[0.08] text-zinc-300"
                  }`}
                >
                  {recordCount}
                </span>
              )}
              {showCount && isCollapsed && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#60A5FA] ring-2 ring-[#040711]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer or Mini Expand Button in Collapsed Mode */}
      <div className="pt-2 border-t border-white/[0.06] w-full">
        {isCollapsed ? (
          <button
            type="button"
            onClick={toggle}
            title="Développer le menu"
            className="w-11 h-8 mx-auto rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-2 py-1 text-xs text-zinc-400 font-mono">
            <p className="font-semibold text-zinc-300 uppercase tracking-wide">
              CADASTRA · CM
            </p>
            <p className="text-zinc-500 text-[11px] leading-tight mt-0.5">
              Moteur géodésique WGS84
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
