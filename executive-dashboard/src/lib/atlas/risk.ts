import type { DomainId, RiskLevel } from "./types.ts";

const CRITICAL_KEYWORDS = ["injury", "abuse", "unsafe", "danger", "hazard", "emergency", "child safety"];

const HIGH_RISK_DOMAINS: DomainId[] = ["compliance"];

const HIGH_ESCALATION_KEYWORDS = [
  "payroll",
  "wage",
  "terminate",
  "termination",
  "lawsuit",
  "legal action",
  "breach",
  "security incident",
];

const LOW_RISK_DOMAINS: DomainId[] = ["analytics", "career", "personal-operations", "executive-operations", "unclear"];

/**
 * Risk is assessed against the Decision Priority Order in the Atlas charter:
 * child safety and legal/compliance exposure always outrank convenience.
 */
export function classifyRisk(domain: DomainId, requestText: string): RiskLevel {
  const normalized = requestText.toLowerCase();

  if (CRITICAL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "critical";
  }

  if (HIGH_RISK_DOMAINS.includes(domain)) {
    return "high";
  }

  if (HIGH_ESCALATION_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "high";
  }

  if (LOW_RISK_DOMAINS.includes(domain)) {
    return "low";
  }

  return "medium";
}
