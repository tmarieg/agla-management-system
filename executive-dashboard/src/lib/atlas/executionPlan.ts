import {
  FINANCIAL_APPROVAL_GATE_ACTION,
  FINANCIAL_APPROVAL_GATE_COMPLETION,
  FINANCIAL_APPROVAL_GATE_OWNER,
  requiresFinancialApprovalGate,
} from "./financial.ts";
import type { AuthorityLevel, DomainId, ExecutionPlanStep } from "./types.ts";

interface BuildExecutionPlanArgs {
  domain: DomainId;
  primaryAgent: string;
  supportingAgents: string[];
  authority: AuthorityLevel;
  tenantName: string;
  requestText: string;
}

/**
 * Generates a plan from a small template (intake -> supporting review ->
 * primary analysis -> approval gate) rather than a bespoke plan per domain,
 * so adding a domain never requires touching this function.
 *
 * Analysis and preparation steps never require approval on their own. A
 * financial-record-change approval gate is inserted whenever the request
 * could touch a financial record (see financial.ts) regardless of the
 * overall authority level — a Prepare-level billing analysis can proceed
 * without approval, but the record change it might lead to cannot.
 */
export function buildExecutionPlan({
  domain,
  primaryAgent,
  supportingAgents,
  authority,
  requestText,
}: BuildExecutionPlanArgs): ExecutionPlanStep[] {
  const domainLabel = domain.replace("-", " ");
  const steps: ExecutionPlanStep[] = [];
  let sequence = 1;

  steps.push({
    sequence: sequence++,
    ownerAgent: "Atlas",
    action:
      domain === "unclear"
        ? "Attempt to classify the request into a tenant, domain, and risk level."
        : `Confirm tenant context and classify the request into the ${domainLabel} domain.`,
    dependency: null,
    authority: "observe",
    approvalRequired: false,
    completionCriteria: "Tenant, domain, and risk classification are recorded in the audit trail.",
  });

  if (domain === "unclear") {
    steps.push({
      sequence: sequence++,
      ownerAgent: "Atlas",
      action: "Request clarification from the requester on domain, desired outcome, and ownership.",
      dependency: `Step ${sequence - 2}`,
      authority: "observe",
      approvalRequired: false,
      completionCriteria: "Requester supplies enough detail for Atlas to classify the request.",
    });
    return steps;
  }

  for (const agent of supportingAgents) {
    steps.push({
      sequence: sequence++,
      ownerAgent: agent,
      action: `Review the request and supply supporting context, records, or constraints relevant to ${domainLabel}.`,
      dependency: `Step ${sequence - 2}`,
      authority: "prepare",
      approvalRequired: false,
      completionCriteria: `${agent} confirms supporting review is complete.`,
    });
  }

  const needsFinancialGate = requiresFinancialApprovalGate(domain, requestText);

  steps.push({
    sequence: sequence++,
    ownerAgent: primaryAgent,
    action: `Prepare the ${domainLabel} analysis and recommended action for review.`,
    dependency: `Step ${sequence - 2}`,
    authority,
    approvalRequired: authority === "restricted" && !needsFinancialGate,
    completionCriteria: `${primaryAgent} delivers a drafted, reviewable analysis ready for the next workflow state. Analysis alone changes no record.`,
  });

  if (needsFinancialGate) {
    steps.push({
      sequence: sequence++,
      ownerAgent: FINANCIAL_APPROVAL_GATE_OWNER,
      action: FINANCIAL_APPROVAL_GATE_ACTION,
      dependency: `Step ${sequence - 2}`,
      authority: "restricted",
      approvalRequired: true,
      completionCriteria: FINANCIAL_APPROVAL_GATE_COMPLETION,
    });
  } else if (authority === "restricted") {
    steps.push({
      sequence: sequence++,
      ownerAgent: "Enterprise Owner",
      action: "Review and approve or deny the proposed action before any execution proceeds.",
      dependency: `Step ${sequence - 2}`,
      authority: "restricted",
      approvalRequired: true,
      completionCriteria: "Enterprise Owner records an explicit approval or denial decision.",
    });
  }

  return steps;
}
