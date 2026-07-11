import type { AuditMetadata, TenantId, WorkflowState } from "./types.ts";

export const ATLAS_VERSION = "1.0.0";

export function buildAuditMetadata(tenantId: TenantId, workflowState: WorkflowState): AuditMetadata {
  return {
    requestId: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    atlasVersion: ATLAS_VERSION,
    tenantId,
    workflowState,
  };
}
