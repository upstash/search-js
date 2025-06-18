export default function KeyValue({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <p className="bg-indigo-50 rounded-lg px-2 py-0.5">
      <b>{label}:</b> <span>{value}</span>
    </p>
  );
}
