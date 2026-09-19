"use client";

const OPTIONS = [
  { value: "", label: "All" },
  { value: "APPLY_NOW", label: "Apply Now" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "MAYBE", label: "Maybe" },
  { value: "SKIP", label: "Skipped" },
  { value: "APPLIED", label: "Applied" },
];

export function Filters({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            value === opt.value
              ? "text-xs px-3 py-1.5 rounded-md border border-accent bg-accent/10 text-accent"
              : "text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
