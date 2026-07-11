import type { Metadata } from "next";

import AppShell from "@/components/layout/AppShell";

import AtlasConsole from "./AtlasConsole";

export const metadata: Metadata = {
  title: "Atlas — AGEMS",
  description: "Atlas request intake and execution-plan console for Amazing Grace Learning Academy.",
};

export default function AtlasPage() {
  return (
    <AppShell>
      <AtlasConsole />
    </AppShell>
  );
}
