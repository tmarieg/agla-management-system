# Atlas v1 Product and Technical Specification

## Objective
Build the first working vertical slice of Atlas inside the existing AGEMS Next.js application.

Atlas v1 must accept an enterprise request, classify it, establish tenant context, identify the operational domain, determine ownership, assign risk and authority, identify required approvals, create an execution plan, and display an auditable result.

## Included
- Tenant-aware request object
- Atlas manifest and charter
- Request intake
- Domain classification
- Risk classification
- Approval determination
- Specialist agent assignment
- Execution-plan generation
- Workflow-state model
- Audit-event model
- Browser testing console
- Deterministic routing tests
- Architecture decision record

## Excluded
- External AI model calls
- Live integrations
- Persistent database
- Authentication
- Automated execution
- n8n
- MCP servers

## Required Atlas Output
- interpretedObjective
- tenantId
- primaryDomain
- primaryAgent
- supportingAgents
- riskLevel
- authorityLevel
- requiredApprovals
- assumptions
- missingInformation
- executionPlan
- completionCriteria
- recommendedNextAction
- workflowState
- auditMetadata

## Acceptance Tests
1. CCS billing request routes to Ledger with Guardian and Penny.
2. Employee training request routes to Sage with Guardian.
3. TRS compliance request routes to Guardian.
4. Unclear request remains with Atlas and requests clarification.
5. All outputs include tenantId.
6. Restricted actions require approval.
7. No result may claim execution occurred.
8. The UI clearly distinguishes proposed work from completed work.
9. Lint and production build pass.
