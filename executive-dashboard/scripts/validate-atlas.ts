/**
 * Deterministic routing validation for Atlas v1 (spec acceptance tests plus
 * the governance corrections: approved agent roster, risk/authority
 * separation, and the financial-record-change approval gate).
 *
 * Runs directly via Node's native TypeScript support: `node scripts/validate-atlas.ts`.
 * No test framework is installed, so this is a plain assertion runner with a
 * non-zero exit code on failure — see docs/architecture/atlas-v1-adr.md, decision 6.
 */
import { specialistAgents } from "../src/lib/atlas/agents.ts";
import { processAtlasRequest } from "../src/lib/atlas/atlas.ts";
import { DEFAULT_TENANT_ID } from "../src/lib/atlas/tenants.ts";

interface Check {
  name: string;
  pass: boolean;
}

const checks: Check[] = [];

function check(name: string, pass: boolean) {
  checks.push({ name, pass });
}

// --- Acceptance test 1: CCS billing request routes to Ledger with Guardian and Penny.
const billing = processAtlasRequest({
  requestText: "Process the CCS billing adjustment for a subsidized family before the funding body deadline.",
});
check("1. CCS billing routes to Ledger", billing.primaryAgent === "Ledger");
check(
  "1. CCS billing includes Guardian and Penny as support",
  billing.supportingAgents.includes("Guardian") && billing.supportingAgents.includes("Penny"),
);
check("1. CCS billing overall authority is Prepare", billing.authorityLevel === "prepare");
check(
  "1. CCS billing analysis steps proceed without prior approval",
  billing.executionPlan.slice(0, -1).every((step) => !step.approvalRequired),
);
check(
  "1. CCS billing plan contains a required approval gate before any financial-record change",
  (() => {
    const gate = billing.executionPlan[billing.executionPlan.length - 1];
    return (
      gate.approvalRequired === true &&
      gate.ownerAgent.toLowerCase().includes("financial approver") &&
      gate.action.toLowerCase().includes("no financial record has been changed")
    );
  })(),
);
check("1. CCS billing executionOccurred is false", billing.executionOccurred === false);

// --- Acceptance test 2: Employee training request routes to Sage with Guardian.
const training = processAtlasRequest({
  requestText: "Schedule mandatory onboarding training for a new lead teacher hire.",
});
check("2. Employee training routes to Sage", training.primaryAgent === "Sage");
check("2. Employee training includes Guardian as support", training.supportingAgents.includes("Guardian"));

// --- Acceptance test 3: TRS compliance request routes to Guardian.
const compliance = processAtlasRequest({
  requestText: "Confirm TRS compliance documentation is ready for mentor review.",
});
check("3. TRS compliance routes to Guardian", compliance.primaryAgent === "Guardian");

// --- Acceptance test 4: Unclear request remains with Atlas and requests clarification.
const unclear = processAtlasRequest({
  requestText: "Can you take care of the thing we talked about?",
});
check("4. Unclear request stays with Atlas", unclear.primaryAgent === "Atlas" && unclear.primaryDomain === "unclear");
check("4. Unclear request lists missing information", unclear.missingInformation.length > 0);
check(
  "4. Unclear request's next action asks for clarification",
  unclear.recommendedNextAction.toLowerCase().includes("clarif"),
);

// --- Acceptance test 5: All outputs include tenantId.
check(
  "5. All outputs include tenantId",
  [billing, training, compliance, unclear].every((result) => result.tenantId === DEFAULT_TENANT_ID),
);

// --- Acceptance test 6: Restricted actions require approval.
const restrictedBilling = processAtlasRequest({
  requestText: "Adjust payroll billing for two employees before the next pay period runs.",
});
check("6. High-risk billing escalates to restricted authority", restrictedBilling.authorityLevel === "restricted");
check("6. Compliance requests are restricted authority", compliance.authorityLevel === "restricted");
check(
  "6. Restricted authority always yields required approvals",
  [restrictedBilling, compliance].every((result) => result.requiredApprovals.length > 0),
);
check(
  "6. Restricted plans end with a human-approval step",
  [restrictedBilling, compliance].every((result) => {
    const last = result.executionPlan[result.executionPlan.length - 1];
    return last.approvalRequired === true && /Enterprise Owner|Financial Approver/i.test(last.ownerAgent);
  }),
);

// --- Acceptance test 7: No result may claim execution occurred.
check(
  "7. executionOccurred is always false",
  [billing, training, compliance, unclear, restrictedBilling].every((result) => result.executionOccurred === false),
);
check(
  "7. workflowState never claims completion",
  [billing, training, compliance, unclear, restrictedBilling].every(
    (result) => result.workflowState === "discussed" || result.workflowState === "proposed",
  ),
);

// --- Approved roster: renamed agents route correctly, retired names are gone.
const enrollment = processAtlasRequest({ requestText: "Process a new enrollment application and waitlist intake." });
check("Roster: enrollment routes to Journey", enrollment.primaryAgent === "Journey");

const technology = processAtlasRequest({ requestText: "Investigate a server outage affecting the school network." });
check("Roster: technology routes to Forge", technology.primaryAgent === "Forge");

const analytics = processAtlasRequest({ requestText: "Build a dashboard report of enrollment trend metrics." });
check("Roster: analytics routes to Beacon", analytics.primaryAgent === "Beacon");

const career = processAtlasRequest({ requestText: "Discuss a career promotion and professional development plan." });
check("Roster: career routes to Scout", career.primaryAgent === "Scout");

const personal = processAtlasRequest({ requestText: "Coordinate a personal household family calendar request." });
check("Roster: personal operations routes to Shepherd", personal.primaryAgent === "Shepherd");

const allAgentNames = [billing, training, compliance, enrollment, technology, analytics, career, personal].flatMap(
  (r) => [r.primaryAgent, ...r.supportingAgents],
);
check(
  "Roster: retired names (Registrar, Circuit, Lumen, Compass, Keeper) never appear",
  !allAgentNames.some((name) => ["Registrar", "Circuit", "Lumen", "Compass", "Keeper"].includes(name)),
);

const rosterNames = Object.values(specialistAgents).map((agent) => agent.name);
check(
  "Roster: all 12 constitutional agents are registered",
  [
    "Atlas",
    "EVA",
    "Penny",
    "Ledger",
    "Sage",
    "Guardian",
    "Grace",
    "Journey",
    "Beacon",
    "Forge",
    "Scout",
    "Shepherd",
  ].every((name) => rosterNames.includes(name)),
);
const eva = Object.values(specialistAgents).find((agent) => agent.name === "EVA");
const grace = Object.values(specialistAgents).find((agent) => agent.name === "Grace");
check("Roster: EVA title matches the Constitution", eva?.title === "Executive Operations Partner");
check("Roster: Grace title matches the Constitution", grace?.title === "Family Experience Director");

// --- Governance correction 2: risk and authority are separate; low risk never auto-grants Execute.
const lowRiskExecutive = processAtlasRequest({
  requestText: "Draft next quarter's board priorities and circulate for executive input.",
});
check("Risk/authority: executive-operations request classifies as low risk", lowRiskExecutive.riskLevel === "low");
check(
  "Risk/authority: low-risk request defaults to Prepare, not Execute",
  lowRiskExecutive.authorityLevel === "prepare",
);
check(
  "Risk/authority: Execute is never assigned automatically across all scenarios",
  [billing, training, compliance, unclear, restrictedBilling, lowRiskExecutive].every(
    (result) => (result.authorityLevel as string) !== "execute",
  ),
);

const readOnlyExecutive = processAtlasRequest({
  requestText: "Review the status of the board's current priorities.",
});
check(
  "Risk/authority: explicitly read-only request may use Observe",
  readOnlyExecutive.authorityLevel === "observe",
);

// --- Governance: Enterprise Constitution basis on every response.
// This billing request is explicitly read-only in phrasing, which would
// normally classify as Observe — but billing always requires the financial
// approval gate, so this is a real Observe-vs-financial-gate conflict that
// Article II requires Atlas to detect and escalate rather than silently
// leave at Observe.
const conflictBilling = processAtlasRequest({
  requestText: "Review the status of the CCS billing account balance for a family.",
});
check(
  "Governance: Observe + financial-gate conflict escalates authority to Prepare",
  conflictBilling.authorityLevel === "prepare",
);
check(
  "Governance: the conflict is recorded in policyConflictsDetected",
  conflictBilling.governanceBasis.policyConflictsDetected.length > 0,
);
check(
  "Governance: the escalated request still carries the financial approval gate",
  conflictBilling.requiredApprovals.length > 0 &&
    conflictBilling.executionPlan[conflictBilling.executionPlan.length - 1].approvalRequired === true,
);

const allResults = [
  billing,
  training,
  compliance,
  unclear,
  restrictedBilling,
  lowRiskExecutive,
  readOnlyExecutive,
  conflictBilling,
];

check(
  "Governance: every result identifies Constitution version 1.0",
  allResults.every((result) => result.governanceBasis.constitutionVersion === "1.0"),
);
check(
  "Governance: Tenant Isolation is applied to every result",
  allResults.every((result) => result.governanceBasis.governingPrinciplesApplied.includes("Tenant Isolation")),
);
check(
  "Governance: restricted work always escalates and requires approval",
  [restrictedBilling, compliance].every(
    (result) => result.governanceBasis.escalationRequired === true && result.requiredApprovals.length > 0,
  ),
);
check(
  "Governance: no result claims execution occurred",
  allResults.every((result) => result.executionOccurred === false),
);

// --- Report results.
const failed = checks.filter((c) => !c.pass);

for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"} - ${c.name}`);
}

console.log(`\n${checks.length - failed.length}/${checks.length} checks passed.`);

if (failed.length > 0) {
  process.exitCode = 1;
}
