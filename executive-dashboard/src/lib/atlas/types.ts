export type TenantId = "amazing-grace-learning-academy";

export interface Tenant {
  id: TenantId;
  name: string;
  status: "active" | "inactive";
}

export type DomainId =
  | "billing"
  | "people-operations"
  | "compliance"
  | "enrollment"
  | "executive-operations"
  | "technology"
  | "analytics"
  | "career"
  | "personal-operations"
  | "unclear";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type AuthorityLevel = "observe" | "prepare" | "execute" | "restricted";

export type WorkflowState =
  | "discussed"
  | "proposed"
  | "drafted"
  | "approved"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "verified"
  | "failed"
  | "blocked"
  | "cancelled";

export interface SpecialistAgent {
  id: string;
  name: string;
  title: string;
  domains: DomainId[];
}

export interface ExecutionPlanStep {
  sequence: number;
  ownerAgent: string;
  action: string;
  dependency: string | null;
  authority: AuthorityLevel;
  approvalRequired: boolean;
  completionCriteria: string;
}

export interface AuditMetadata {
  requestId: string;
  receivedAt: string;
  atlasVersion: string;
  tenantId: TenantId;
  workflowState: WorkflowState;
}

export interface AtlasRequestInput {
  requestText: string;
  tenantId?: TenantId;
  requestedBy?: string;
}

export interface GovernanceBasis {
  constitutionVersion: string;
  governingPrinciplesApplied: string[];
  policyConflictsDetected: string[];
  escalationRequired: boolean;
}

export interface AtlasResponse {
  interpretedObjective: string;
  tenantId: TenantId;
  primaryDomain: DomainId;
  primaryAgent: string;
  supportingAgents: string[];
  riskLevel: RiskLevel;
  authorityLevel: AuthorityLevel;
  requiredApprovals: string[];
  assumptions: string[];
  missingInformation: string[];
  executionPlan: ExecutionPlanStep[];
  completionCriteria: string[];
  recommendedNextAction: string;
  workflowState: WorkflowState;
  auditMetadata: AuditMetadata;
  governanceBasis: GovernanceBasis;
  /** Always false in v1: Atlas produces plans, it never executes them. */
  executionOccurred: false;
}
