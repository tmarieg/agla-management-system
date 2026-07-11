import type { AuthorityLevel, DomainId, RiskLevel } from "./types.ts";

/**
 * Atlas operates under the AGEMS Enterprise Constitution — see
 * docs/governance/enterprise-constitution.md for the ratified text. Atlas
 * does not parse that document at runtime; this module is a typed reference
 * to it (constitution version, its order of authority, and a deterministic
 * mapping from a request's classification to the constitutional principles
 * and escalation behavior that apply). See docs/architecture/atlas-v1-adr.md
 * for why parsing was deferred.
 */
export const CONSTITUTION_VERSION = "1.0";

export const CONSTITUTION_TITLE = "AGEMS Enterprise Constitution";

/** Article II — Order of Authority. A lower authority may never override a higher one. */
export const orderOfAuthority = [
  "Applicable law and regulation",
  "Immediate safety",
  "AGEMS Enterprise Constitution",
  "Approved enterprise policies",
  "Approved tenant policies",
  "Approved department policies",
  "Approved workflow rules",
  "Explicit human instructions within authorized scope",
  "Agent recommendations",
  "Convenience, speed, and efficiency",
] as const;

export const governanceManifest = {
  constitutionVersion: CONSTITUTION_VERSION,
  constitutionTitle: CONSTITUTION_TITLE,
  statement:
    "The AGEMS Enterprise Constitution is the highest internal governing authority of this platform. Atlas operates under it, does not outrank it, and may not create or expand its own authority.",
  orderOfAuthority,
} as const;

/**
 * Deterministically selects which constitutional principles (Article III)
 * are relevant to a request's classification, without parsing the
 * Constitution text itself.
 */
export function selectGoverningPrinciples(
  domain: DomainId,
  risk: RiskLevel,
  authority: AuthorityLevel,
  needsFinancialGate: boolean,
): string[] {
  const principles = new Set<string>();

  principles.add("Truth Before Appearance");
  principles.add("Verified Completion");
  principles.add("Explainable Governance");
  principles.add("Tenant Isolation");

  if (domain === "unclear") {
    principles.add("Prevention Before Crisis");
  }

  if (risk === "high" || risk === "critical") {
    principles.add("Safety Before Efficiency");
  }

  if (authority === "restricted") {
    principles.add("Human and Agent Authority");
  }

  if (needsFinancialGate) {
    principles.add("Approvals and Separation of Duties");
  }

  return Array.from(principles);
}

/**
 * Atlas v1 has no live policy engine, so conflict detection is limited to a
 * structural check it can actually perform: a request cannot be both
 * "explicitly read-only" (Observe) and name a financial-record change, which
 * always requires approval before it is applied. Conflicts are surfaced, not
 * silently resolved, per Article II ("identify the conflict ... escalate,
 * and record the decision").
 */
export function detectPolicyConflicts(authority: AuthorityLevel, needsFinancialGate: boolean): string[] {
  const conflicts: string[] = [];

  if (authority === "observe" && needsFinancialGate) {
    conflicts.push(
      "Request was classified Observe (read-only) but names a financial-record change, which always requires prior approval under Article IV and Article IX. Authority was escalated to Prepare and the financial approval gate applies.",
    );
  }

  return conflicts;
}

/**
 * Escalation is required whenever Atlas cannot proceed without a human
 * decision: the domain is unclear (needs clarification) or the authority is
 * Restricted (needs approval before any consequential step).
 */
export function determineEscalationRequired(domain: DomainId, authority: AuthorityLevel): boolean {
  return domain === "unclear" || authority === "restricted";
}
