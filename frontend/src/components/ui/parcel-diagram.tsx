"use client";

import React from "react";

interface ParcelDiagramProps {
  variant: "declared" | "verified";
}

const vertices = [
  { x: 40, y: 140, label: "B1" },
  { x: 58, y: 52, label: "B2" },
  { x: 172, y: 34, label: "B3" },
  { x: 302, y: 74, label: "B4" },
  { x: 280, y: 150, label: "B5" },
  { x: 118, y: 156, label: "B6" },
];

const points = vertices.map((v) => `${v.x},${v.y}`).join(" ");

export function ParcelDiagram({ variant }: ParcelDiagramProps) {
  const verified = variant === "verified";
  const stroke = verified ? "#00DF8F" : "#71717A";
  const fill = verified ? "rgba(0, 223, 143, 0.06)" : "rgba(255, 255, 255, 0.02)";
  const label = verified ? "Empreinte calculée" : "Limites déclarées";

  return (
    <svg
      viewBox="0 0 340 180"
      className="h-40 w-full"
      role="img"
      aria-label={`Schéma de principe : ${label.toLowerCase()}`}
    >
      <title>{label}</title>

      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
        <line x1="20" y1="170" x2="320" y2="170" />
        <line x1="20" y1="20" x2="20" y2="170" />
        <line x1="20" y1="20" x2="26" y2="20" />
        <line x1="20" y1="170" x2="26" y2="170" />
        <line x1="320" y1="164" x2="320" y2="170" />
      </g>

      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={verified ? 1.8 : 1.4}
        strokeDasharray={verified ? undefined : "5 4"}
        strokeLinejoin="round"
      />

      {vertices.map((v) => (
        <g key={v.label}>
          <circle cx={v.x} cy={v.y} r="3" fill={stroke} />
          <text
            x={v.x + 6}
            y={v.y - 5}
            fill={verified ? "#00DF8F" : "#A1A1AA"}
            fontSize="10"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {v.label}
          </text>
        </g>
      ))}

      <text
        x="20"
        y="14"
        fill="#71717A"
        fontSize="11"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {label}
      </text>
    </svg>
  );
}
