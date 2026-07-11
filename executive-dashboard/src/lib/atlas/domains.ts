import type { DomainId } from "./types.ts";

export interface DomainRoute {
  domain: DomainId;
  primaryAgent: string;
  supportingAgents: string[];
  keywords: string[];
}

export const domainRoutes: DomainRoute[] = [
  {
    domain: "billing",
    primaryAgent: "Ledger",
    supportingAgents: ["Guardian", "Penny"],
    keywords: ["billing", "invoice", "ccs", "subsidy", "payment", "tuition", "payroll"],
  },
  {
    domain: "people-operations",
    primaryAgent: "Sage",
    supportingAgents: ["Guardian"],
    keywords: ["employee", "training", "onboarding", "staff", "hiring", "hire", "performance", "termination"],
  },
  {
    domain: "compliance",
    primaryAgent: "Guardian",
    supportingAgents: [],
    keywords: ["trs", "compliance", "licensing", "regulatory", "inspection", "audit"],
  },
  {
    domain: "enrollment",
    primaryAgent: "Journey",
    supportingAgents: ["Ledger", "Guardian"],
    keywords: ["enrollment", "enroll", "waitlist", "admission", "registration", "intake"],
  },
  {
    domain: "executive-operations",
    primaryAgent: "Atlas",
    supportingAgents: [],
    keywords: ["strategy", "roadmap", "board", "executive", "priorities", "organization-wide"],
  },
  {
    domain: "technology",
    primaryAgent: "Forge",
    supportingAgents: ["Guardian"],
    keywords: ["software", "system", "server", "outage", "security", "breach", "app", "network"],
  },
  {
    domain: "analytics",
    primaryAgent: "Beacon",
    supportingAgents: [],
    keywords: ["analytics", "report", "dashboard", "metrics", "trend", "forecast"],
  },
  {
    domain: "career",
    primaryAgent: "Scout",
    supportingAgents: ["Sage"],
    keywords: ["career", "promotion", "professional development", "resume", "mentorship"],
  },
  {
    domain: "personal-operations",
    primaryAgent: "Shepherd",
    supportingAgents: [],
    keywords: ["personal", "household", "private errand", "family calendar"],
  },
];

/**
 * Deterministic keyword classifier: counts keyword hits per domain and returns
 * the highest-scoring route, or null when nothing matches (request is "unclear").
 * Ties resolve in favor of the earlier-declared domain.
 */
export function classifyDomain(requestText: string): DomainRoute | null {
  const normalized = requestText.toLowerCase();

  let best: { route: DomainRoute; hits: number } | null = null;
  for (const route of domainRoutes) {
    const hits = route.keywords.filter((keyword) => normalized.includes(keyword)).length;
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { route, hits };
    }
  }

  return best ? best.route : null;
}
