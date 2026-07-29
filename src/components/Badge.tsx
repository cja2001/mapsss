export function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-status-success/15 text-emerald-300"
          : "bg-status-neutral/20 text-slate-400"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
