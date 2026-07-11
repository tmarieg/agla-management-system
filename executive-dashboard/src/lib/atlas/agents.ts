import type { SpecialistAgent } from "./types.ts";

export const specialistAgents: Record<string, SpecialistAgent> = {
  atlas: {
    id: "atlas",
    name: "Atlas",
    title: "Chief Enterprise Officer",
    domains: ["executive-operations", "unclear"],
  },
  eva: {
    id: "eva",
    name: "EVA",
    title: "Executive Operations Partner",
    // Present in the roster per the Enterprise Constitution. Not yet wired
    // into domain routing — Atlas remains primaryAgent for
    // executive-operations pending a governance decision to reassign it.
    domains: [],
  },
  ledger: {
    id: "ledger",
    name: "Ledger",
    title: "Billing and Revenue Operations Manager",
    domains: ["billing"],
  },
  penny: {
    id: "penny",
    name: "Penny",
    title: "Chief Financial Officer",
    domains: ["billing"],
  },
  guardian: {
    id: "guardian",
    name: "Guardian",
    title: "Chief Compliance and Risk Officer",
    domains: ["compliance"],
  },
  sage: {
    id: "sage",
    name: "Sage",
    title: "Chief People Officer",
    domains: ["people-operations"],
  },
  grace: {
    id: "grace",
    name: "Grace",
    title: "Family Experience Director",
    // Present in the roster per the Enterprise Constitution. No domain in
    // this vertical slice maps to "family experience" yet, so Grace is not
    // wired into routing — adding that domain is a governance decision, not
    // an engineering one, per Article V ("new permanent agents require a
    // durable enterprise function, defined authority... and governance
    // approval").
    domains: [],
  },
  journey: {
    id: "journey",
    name: "Journey",
    title: "Enrollment and Child Lifecycle Manager",
    domains: ["enrollment"],
  },
  forge: {
    id: "forge",
    name: "Forge",
    title: "Chief Technology Officer",
    domains: ["technology"],
  },
  beacon: {
    id: "beacon",
    name: "Beacon",
    title: "Business Intelligence Director",
    domains: ["analytics"],
  },
  scout: {
    id: "scout",
    name: "Scout",
    title: "Career Strategy and Opportunity Director",
    domains: ["career"],
  },
  shepherd: {
    id: "shepherd",
    name: "Shepherd",
    title: "Personal and Family Operations Partner",
    domains: ["personal-operations"],
  },
};
