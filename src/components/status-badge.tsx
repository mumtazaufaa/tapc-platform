export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-forest-800/10 px-2.5 py-0.5 text-xs font-medium text-forest-800">
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-sage-500">
      Nonaktif
    </span>
  );
}
