type DashboardCardProps = {
  title: string;
  value: string;
  note: string;
};

export default function DashboardCard({
  title,
  value,
  note,
}: DashboardCardProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-slate-400 text-sm uppercase tracking-wide">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-slate-400 mt-2">
        {note}
      </p>
    </div>
  );
}