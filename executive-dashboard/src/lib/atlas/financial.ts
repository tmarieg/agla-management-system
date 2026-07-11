import type { DomainId } from "./types.ts";

const FINANCIAL_RECORD_CHANGE_KEYWORDS = [
  "billing-plan modification",
  "billing plan modification",
  "balance adjustment",
  "credit",
  "write-off",
  "write off",
  "family-fee change",
  "family fee change",
  "tuition-rate change",
  "tuition rate change",
  "payment record",
  "reimbursement record",
];

/**
 * True whenever a request could result in a change to a financial record.
 * The billing domain always qualifies; any other domain qualifies only when
 * the request text names one of the specific financial-record change types
 * (e.g. an enrollment request that also changes a tuition rate).
 */
export function requiresFinancialApprovalGate(domain: DomainId, requestText: string): boolean {
  if (domain === "billing") {
    return true;
  }
  const normalized = requestText.toLowerCase();
  return FINANCIAL_RECORD_CHANGE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export const FINANCIAL_APPROVAL_GATE_OWNER = "Enterprise Owner or Delegated Financial Approver";

export const FINANCIAL_APPROVAL_GATE_ACTION =
  "Require explicit approval from the Enterprise Owner or a delegated financial approver before applying any billing-plan modification, balance adjustment, credit, write-off, family-fee change, tuition-rate change, or payment or reimbursement record change. No financial record has been changed.";

export const FINANCIAL_APPROVAL_GATE_COMPLETION =
  "The Enterprise Owner or a delegated financial approver has explicitly approved or denied the specific financial-record change; no financial record is changed until that approval is recorded.";

export function financialApprovalGateSummary(tenantName: string): string {
  return `Enterprise Owner or a delegated financial approver must approve any billing-plan modification, balance adjustment, credit, write-off, family-fee change, tuition-rate change, or payment/reimbursement record change for ${tenantName} before it is applied. No financial record has been changed.`;
}
