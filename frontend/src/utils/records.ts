import {
  PlanVerificationResponse,
  VerificationRecord,
  VerificationSource,
} from "@/types/cadastre";

export type VerdictTone = "success" | "danger" | "warning";

export interface Verdict {
  label: string;
  tone: VerdictTone;
}

/**
 * A single source of truth for how a verification is described across the
 * workspace panes: the map badge, the investigations table, the reports list
 * and the intelligence counters must never disagree about a case.
 */
export function getVerdict(result: PlanVerificationResponse): Verdict {
  // A self-intersecting polygon is a topology failure even when the engine
  // escalates the risk score to CRITICAL_FRAUD. Label it as such so the map,
  // the dossier and the reports never call a bow-tie parcel "fraud".
  if (result.self_intersecting) {
    return { label: "Anomalie topologique", tone: "warning" };
  }

  if (
    result.superficie_fictive_detected ||
    result.risk_level === "CRITICAL_FRAUD" ||
    (result.risk_level === "HIGH" && !result.tolerance_passed)
  ) {
    return { label: "Fraude suspectée", tone: "danger" };
  }

  if (result.risk_level === "HIGH" || result.risk_level === "MEDIUM") {
    return { label: "Anomalie topologique", tone: "warning" };
  }

  return { label: "Conforme", tone: "success" };
}

export function isFlagged(record: VerificationRecord): boolean {
  return getVerdict(record.result).tone !== "success";
}

export function getSourceLabel(source: VerificationSource): string {
  switch (source) {
    case "upload":
      return "Extraction IA";
    case "manual":
      return "Saisie manuelle";
    case "dataset":
      return "Jeu de données";
    default:
      return "Audit";
  }
}

export function formatRecordDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function makeRecordId(record: Omit<VerificationRecord, "id">): string {
  return `${record.result.plan_id}-${record.result.verification_hash.slice(0, 12)}`;
}

/** Aggregate numbers used by the investigations/intelligence headers. */
export function summarizeRecords(records: VerificationRecord[]) {
  const total = records.length;
  const flagged = records.filter(isFlagged).length;
  const compliant = total - flagged;
  const maxDiscrepancy = records.reduce(
    (max, record) => Math.max(max, Math.abs(record.result.discrepancy_percentage)),
    0
  );
  const totalArea = records.reduce(
    (sum, record) => sum + record.result.computed_area_sqm,
    0
  );

  return {
    total,
    flagged,
    compliant,
    maxDiscrepancy,
    totalArea,
    complianceRate: total === 0 ? 0 : Math.round((compliant / total) * 100),
  };
}
