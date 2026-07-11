import { financialApprovalGateSummary } from "./financial.ts";
import type { AuthorityLevel, DomainId, RiskLevel } from "./types.ts";

const READ_ONLY_KEYWORDS = ["review", "assess", "status of", "look up", "check on", "report on", "summarize"];

const MUTATING_KEYWORDS = [
  "update",
  "change",
  "adjust",
  "modify",
  "process",
  "submit",
  "schedule",
  "approve",
  "terminate",
  "enroll",
  "pay",
  "reimburse",
  "write off",
  "write-off",
];

/**
 * A request is "explicitly read-only" only when it carries a read-only signal
 * and no signal that anything would be changed. Ambiguous or mixed phrasing
 * defaults to not-read-only, so Prepare (not Observe) is the safer default.
 */
export function isExplicitlyReadOnly(requestText: string): boolean {
  const normalized = requestText.toLowerCase();
  const hasReadOnlySignal = READ_ONLY_KEYWORDS.some((keyword) => normalized.includes(keyword));
  const hasMutatingSignal = MUTATING_KEYWORDS.some((keyword) => normalized.includes(keyword));
  return hasReadOnlySignal && !hasMutatingSignal;
}

/**
 * Risk and authority are separate concepts: risk describes exposure, and
 * authority describes how much independence Atlas has. Atlas v1 performs no
 * real execution, so Execute is never assigned automatically here — only
 * Observe, Prepare, or Restricted are reachable.
 *
 * - Restricted: risk is high or critical, regardless of domain.
 * - Observe: the domain is unclear, or the request is explicitly read-only.
 * - Prepare: everything else (the default for low/medium-risk planned work).
 */
export function determineAuthority(domain: DomainId, risk: RiskLevel, requestText: string): AuthorityLevel {
  if (domain === "unclear") {
    return "observe";
  }
  if (risk === "critical" || risk === "high") {
    return "restricted";
  }
  if (isExplicitlyReadOnly(requestText)) {
    return "observe";
  }
  return "prepare";
}

export function determineRequiredApprovals(
  domain: DomainId,
  authority: AuthorityLevel,
  tenantName: string,
  needsFinancialGate: boolean,
): string[] {
  const approvals: string[] = [];

  if (authority === "restricted") {
    approvals.push(
      `Enterprise Owner approval required before any ${domain.replace("-", " ")} action proceeds for ${tenantName}.`,
    );
  }

  if (needsFinancialGate) {
    approvals.push(financialApprovalGateSummary(tenantName));
  }

  return approvals;
}
