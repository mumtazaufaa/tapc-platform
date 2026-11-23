export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-petal-300/70 px-2.5 py-0.5 text-xs font-medium text-navy-900">
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-navy-900/10 px-2.5 py-0.5 text-xs font-medium text-muted">
      Nonaktif
    </span>
  );
}
