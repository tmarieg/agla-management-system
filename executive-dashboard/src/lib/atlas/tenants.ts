import type { Tenant, TenantId } from "./types.ts";

export const DEFAULT_TENANT_ID: TenantId = "amazing-grace-learning-academy";

export const tenantRegistry: Record<TenantId, Tenant> = {
  "amazing-grace-learning-academy": {
    id: "amazing-grace-learning-academy",
    name: "Amazing Grace Learning Academy",
    status: "active",
  },
};

export function resolveTenant(tenantId?: TenantId): Tenant {
  const resolvedId = tenantId ?? DEFAULT_TENANT_ID;
  return tenantRegistry[resolvedId] ?? tenantRegistry[DEFAULT_TENANT_ID];
}
