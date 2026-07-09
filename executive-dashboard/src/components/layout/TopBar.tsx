export default function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-4">
      <div>
        <p className="text-sm text-slate-400">AGEMS</p>
        <p className="text-xs text-slate-500">Amazing Grace Enterprise Management System</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200">
          AG
        </div>
      </div>
    </header>
  );
}
