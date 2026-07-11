import { buildAuditMetadata } from "./audit.ts";
import { determineAuthority, determineRequiredApprovals } from "./authority.ts";
import { classifyDomain } from "./domains.ts";
import { buildExecutionPlan } from "./executionPlan.ts";
import { requiresFinancialApprovalGate } from "./financial.ts";
import {
  CONSTITUTION_VERSION,
  detectPolicyConflicts,
  determineEscalationRequired,
  selectGoverningPrinciples,
} from "./governance.ts";
import { classifyRisk } from "./risk.ts";
import { resolveTenant } from "./tenants.ts";
import type { AtlasRequestInput, AtlasResponse, GovernanceBasis, WorkflowState } from "./types.ts";

const UNCLEAR_MISSING_INFORMATION = [
  "The operational domain (billing, people operations, compliance, enrollment, executive operations, technology, analytics, career, or personal operations) could not be determined from the request text.",
  "The desired outcome or decision Atlas should prepare is not clear.",
];

/**
 * Orchestrates one Atlas request end to end: tenant resolution, domain
 * classification, risk/authority assignment, execution-plan generation, and
 * audit metadata. Pure and deterministic — no model calls, no side effects.
 */
export function processAtlasRequest(input: AtlasRequestInput): AtlasResponse {
  const tenant = resolveTenant(input.tenantId);
  const trimmedText = input.requestText.trim();

  const route = classifyDomain(trimmedText);
  const domain = route?.domain ?? "unclear";
  const primaryAgent = route?.primaryAgent ?? "Atlas";
  const supportingAgents = route?.supportingAgents ?? [];

  const riskLevel = classifyRisk(domain, trimmedText);
  const needsFinancialGate = domain !== "unclear" && requiresFinancialApprovalGate(domain, trimmedText);

  let authorityLevel = determineAuthority(domain, riskLevel, trimmedText);
  const policyConflictsDetected = detectPolicyConflicts(authorityLevel, needsFinancialGate);
  // Article II: when authorities conflict, apply the hierarchy and escalate
  // rather than silently keeping the lower (Observe) classification.
  if (policyConflictsDetected.length > 0 && authorityLevel === "observe") {
    authorityLevel = "prepare";
  }

  const requiredApprovals = determineRequiredApprovals(domain, authorityLevel, tenant.name, needsFinancialGate);

  const executionPlan = buildExecutionPlan({
    domain,
    primaryAgent,
    supportingAgents,
    authority: authorityLevel,
    tenantName: tenant.name,
    requestText: trimmedText,
  });

  const completionCriteria = [
    ...executionPlan.map((step) => step.completionCriteria),
    "No step may be marked complete until Atlas records verified evidence of the outcome.",
  ];

  const assumptions: string[] = [];
  if (!input.tenantId) {
    assumptions.push(`Assumed this request applies to ${tenant.name} because no tenant was specified.`);
  }
  assumptions.push(
    "Assumed Atlas orchestrates this request rather than routing it directly to a specialist without review.",
  );

  const missingInformation: string[] = domain === "unclear" ? [...UNCLEAR_MISSING_INFORMATION] : [];

  const workflowState: WorkflowState = domain === "unclear" ? "discussed" : "proposed";

  const domainLabel = domain.replace("-", " ");
  const recommendedNextAction =
    domain === "unclear"
      ? "Ask the requester to clarify the domain, desired outcome, and any deadline before Atlas proposes a plan."
      : `Route to ${primaryAgent}${
          supportingAgents.length ? ` with support from ${supportingAgents.join(" and ")}` : ""
        } to prepare the ${domainLabel} analysis for review.${
          needsFinancialGate
            ? " Any financial-record change requires Enterprise Owner or delegated financial approver approval before it is applied."
            : ""
        }`;

  const interpretedObjective =
    domain === "unclear"
      ? `Atlas could not confidently classify this request for ${tenant.name} and is holding it for clarification: "${trimmedText}"`
      : `Prepare and route a ${domainLabel} action for ${tenant.name}: "${trimmedText}"`;

  const governanceBasis: GovernanceBasis = {
    constitutionVersion: CONSTITUTION_VERSION,
    governingPrinciplesApplied: selectGoverningPrinciples(domain, riskLevel, authorityLevel, needsFinancialGate),
    policyConflictsDetected,
    escalationRequired: determineEscalationRequired(domain, authorityLevel),
  };

  return {
    interpretedObjective,
    tenantId: tenant.id,
    primaryDomain: domain,
    primaryAgent,
    supportingAgents,
    riskLevel,
    authorityLevel,
    requiredApprovals,
    assumptions,
    missingInformation,
    executionPlan,
    completionCriteria,
    recommendedNextAction,
    workflowState,
    auditMetadata: buildAuditMetadata(tenant.id, workflowState),
    governanceBasis,
    executionOccurred: false,
  };
}
