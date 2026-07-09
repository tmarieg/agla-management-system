import DashboardCard from "@/components/DashboardCard";
import { dashboardMetrics } from "@/data/dashboardMetrics";
import AppShell from "@/components/layout/AppShell";

export default function Home() {
  return (
    <AppShell>
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">AGEMS Executive Dashboard</h1>
        <p className="text-slate-300 mb-8">
          Amazing Grace Enterprise Management System
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {dashboardMetrics.map((metric) => (
            <DashboardCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              note={metric.note}
/>
))}
        </div>

        <section className="mt-10 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-2xl font-semibold mb-4">Command Center</h2>

          <ul className="space-y-3 text-slate-300">
            <li>✅ Track enrollment, attendance, payroll, and compliance</li>
            <li>✅ Build repeatable operating systems</li>
            <li>✅ Turn chaos into dashboards, workflows, and decisions</li>
            <li>✅ Create the foundation for AGEMS as a real platform</li>
          </ul>
        </section>
      </section>
    </AppShell>
  );
}