export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block text-muted">{label}</span>
      {children}
    </label>
  );
}