"use client";

import { useState } from "react";

import type { AtlasResponse } from "@/lib/atlas";

const EXAMPLE_REQUESTS = [
  {
    label: "CCS billing",
    text: "Process the CCS billing adjustment for a subsidized family before the funding body deadline.",
  },
  {
    label: "Employee training",
    text: "Schedule mandatory onboarding training for a new lead teacher hire.",
  },
  {
    label: "TRS compliance",
    text: "Confirm TRS compliance documentation is ready for mentor review.",
  },
  {
    label: "Unclear request",
    text: "Can you take care of the thing we talked about?",
  },
];

const RISK_STYLES: Record<string, string> = {
  low: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  medium: "bg-amber-900/40 text-amber-300 border-amber-800",
  high: "bg-orange-900/40 text-orange-300 border-orange-800",
  critical: "bg-red-900/40 text-red-300 border-red-800",
};

const AUTHORITY_STYLES: Record<string, string> = {
  observe: "bg-slate-800 text-slate-300 border-slate-700",
  prepare: "bg-sky-900/40 text-sky-300 border-sky-800",
  execute: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  restricted: "bg-red-900/40 text-red-300 border-red-800",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

export default function AtlasConsole() {
  const [requestText, setRequestText] = useState("");
  const [result, setResult] = useState<AtlasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitRequest(text: string) {
    if (!text.trim()) {
      setError("Enter a request for Atlas to classify.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: text }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "Atlas could not process the request.");
        setResult(null);
        return;
      }

      setResult(payload as AtlasResponse);
    } catch {
      setError("Could not reach Atlas. Check that the dev server is running.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-sm text-slate-400">Amazing Grace Learning Academy</p>
        <h1 className="text-4xl font-bold mb-2">Atlas — Chief Enterprise Officer</h1>
        <p className="text-slate-300 max-w-3xl">
          Atlas turns an executive request into a governed execution plan: tenant context, domain, risk, authority,
          required approvals, and step-by-step ownership. Atlas orchestrates specialist agents — it does not replace
          them.
        </p>
      </header>

      <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-sm text-amber-200">
        <span className="font-semibold">No execution has occurred.</span> Every result below is a proposed plan for
        human review. Atlas v1 never carries out actions automatically — restricted actions always require Enterprise
        Owner approval.
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_REQUESTS.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => setRequestText(example.text)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              {example.label}
            </button>
          ))}
        </div>

        <textarea
          value={requestText}
          onChange={(event) => setRequestText(event.target.value)}
          placeholder="Describe the request Atlas should classify and plan…"
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitRequest(requestText)}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Atlas is classifying…" : "Send to Atlas"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={`Workflow: ${result.workflowState}`} className="bg-slate-800 text-slate-200 border-slate-700" />
            <Badge label="Proposed — not executed" className="bg-amber-900/40 text-amber-300 border-amber-800" />
            <Badge label={`Risk: ${result.riskLevel}`} className={RISK_STYLES[result.riskLevel]} />
            <Badge label={`Authority: ${result.authorityLevel}`} className={AUTHORITY_STYLES[result.authorityLevel]} />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
            <h2 className="text-lg font-semibold">Interpreted objective</h2>
            <p className="text-slate-300">{result.interpretedObjective}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Tenant & domain</h2>
              <dl className="text-sm text-slate-300 space-y-1">
                <div className="flex justify-between"><dt className="text-slate-500">Tenant</dt><dd>{result.tenantId}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Primary domain</dt><dd>{result.primaryDomain}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Primary agent</dt><dd>{result.primaryAgent}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Supporting agents</dt><dd>{result.supportingAgents.length ? result.supportingAgents.join(", ") : "None"}</dd></div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Required approvals</h2>
              {result.requiredApprovals.length === 0 ? (
                <p className="text-sm text-slate-400">None required at this authority level.</p>
              ) : (
                <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                  {result.requiredApprovals.map((approval) => (
                    <li key={approval}>{approval}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Assumptions</h2>
              <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                {result.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Missing information</h2>
              {result.missingInformation.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing outstanding.</p>
              ) : (
                <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                  {result.missingInformation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold">Execution plan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Owner</th>
                    <th className="py-2 pr-4">Action</th>
                    <th className="py-2 pr-4">Dependency</th>
                    <th className="py-2 pr-4">Authority</th>
                    <th className="py-2 pr-4">Approval</th>
                    <th className="py-2 pr-4">Completion criteria</th>
                  </tr>
                </thead>
                <tbody>
                  {result.executionPlan.map((step) => (
                    <tr key={step.sequence} className="border-t border-slate-800 align-top">
                      <td className="py-2 pr-4">{step.sequence}</td>
                      <td className="py-2 pr-4 font-medium text-slate-100">{step.ownerAgent}</td>
                      <td className="py-2 pr-4">{step.action}</td>
                      <td className="py-2 pr-4 text-slate-500">{step.dependency ?? "—"}</td>
                      <td className="py-2 pr-4">{step.authority}</td>
                      <td className="py-2 pr-4">{step.approvalRequired ? "Required" : "Not required"}</td>
                      <td className="py-2 pr-4">{step.completionCriteria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Completion criteria</h2>
              <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                {result.completionCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Recommended next action</h2>
              <p className="text-sm text-slate-300">{result.recommendedNextAction}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Audit metadata</h2>
              <dl className="text-sm text-slate-300 space-y-1">
                <div className="flex justify-between"><dt className="text-slate-500">Request ID</dt><dd>{result.auditMetadata.requestId}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Received at</dt><dd>{result.auditMetadata.receivedAt}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Atlas version</dt><dd>{result.auditMetadata.atlasVersion}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Workflow state</dt><dd>{result.auditMetadata.workflowState}</dd></div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
              <h2 className="text-lg font-semibold">Governance basis</h2>
              <dl className="text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Constitution version</dt>
                  <dd>{result.governanceBasis.constitutionVersion}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Escalation required</dt>
                  <dd>{result.governanceBasis.escalationRequired ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1">Governing principles applied</dt>
                  <dd className="flex flex-wrap gap-1">
                    {result.governanceBasis.governingPrinciplesApplied.map((principle) => (
                      <span
                        key={principle}
                        className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {principle}
                      </span>
                    ))}
                  </dd>
                </div>
                {result.governanceBasis.policyConflictsDetected.length > 0 && (
                  <div>
                    <dt className="text-amber-400 mb-1">Policy conflicts detected</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1">
                        {result.governanceBasis.policyConflictsDetected.map((conflict) => (
                          <li key={conflict}>{conflict}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
