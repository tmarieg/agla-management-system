type AppShellProps = {
  children: React.ReactNode;
};

import { navigation } from "@/data/navigation";

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">AGEMS</h2>
          <p className="mt-1 text-sm text-slate-400">Command Center</p>

<nav className="mt-8 space-y-3 text-sm">
  {navigation.map((item, index) => (
    <a
      key={item.name}
      className={
        index === 0
          ? "block rounded-lg bg-slate-800 px-4 py-2"
          : "block rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-800"
      }
      href={item.href}
    >
      {item.name}
    </a>
  ))}
</nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}