"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  title: string;
  description: string;
  url: string;
  budgetMin: string;
  budgetMax: string;
  hourlyMin: string;
  hourlyMax: string;
  skills: string;
  postedAt: string;
  proposalsLabel: string;
  hires: string;
  clientCountry: string;
  clientRating: string;
  clientSpent: string;
  paymentVerified: boolean;
  locationRequirement: string;
}

const EMPTY: FormState = {
  title: "",
  description: "",
  url: "",
  budgetMin: "",
  budgetMax: "",
  hourlyMin: "",
  hourlyMax: "",
  skills: "",
  postedAt: "",
  proposalsLabel: "",
  hires: "",
  clientCountry: "",
  clientRating: "",
  clientSpent: "",
  paymentVerified: false,
  locationRequirement: "",
};

export function ManualJobImport() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; status: string } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const payload = {
      title: form.title,
      description: form.description,
      url: form.url,
      budgetMin: form.budgetMin || undefined,
      budgetMax: form.budgetMax || undefined,
      hourlyMin: form.hourlyMin || undefined,
      hourlyMax: form.hourlyMax || undefined,
      skills: form.skills
        ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      // datetime-local has no timezone offset — convert to an absolute ISO
      // instant here in the browser (correct local clock) instead of letting
      // the server parse a bare string in its own timezone.
      postedAt: form.postedAt ? new Date(form.postedAt).toISOString() : undefined,
      proposalsLabel: form.proposalsLabel || undefined,
      hires: form.hires || undefined,
      clientCountry: form.clientCountry || undefined,
      clientRating: form.clientRating || undefined,
      clientSpent: form.clientSpent || undefined,
      paymentVerified: form.paymentVerified,
      locationRequirement: form.locationRequirement || undefined,
    };

    try {
      const res = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok && !data.job) {
        setError(typeof data.error === "string" ? data.error : "Failed to analyze job");
        return;
      }

      if (data.error) {
        setError(`Saved, but analysis failed: ${data.error}`);
      }

      setResult({ id: data.job.id, status: data.job.status });
      setForm(EMPTY);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 mb-6">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-sm font-medium flex items-center gap-2"
      >
        {expanded ? "▾" : "▸"} Analyze Job
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">Job title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Job description *</label>
            <textarea
              required
              rows={8}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Job URL *</label>
              <input
                type="url"
                required
                placeholder="https://www.upwork.com/jobs/~..."
                value={form.url}
                onChange={(e) => update("url", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Budget min</label>
              <input
                value={form.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Budget max</label>
              <input
                value={form.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Hourly min</label>
              <input
                value={form.hourlyMin}
                onChange={(e) => update("hourlyMin", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Hourly max</label>
              <input
                value={form.hourlyMax}
                onChange={(e) => update("hourlyMax", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Skills (comma separated)</label>
              <input
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Posted at</label>
              <input
                type="datetime-local"
                value={form.postedAt}
                onChange={(e) => update("postedAt", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Proposals</label>
              <select
                value={form.proposalsLabel}
                onChange={(e) => update("proposalsLabel", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Unknown</option>
                <option value="Less than 5">Less than 5</option>
                <option value="5 to 10">5 to 10</option>
                <option value="10 to 15">10 to 15</option>
                <option value="15 to 20">15 to 20</option>
                <option value="20 to 50">20 to 50</option>
                <option value="50+">50+</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Hires</label>
              <input
                value={form.hires}
                onChange={(e) => update("hires", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Client country</label>
              <input
                value={form.clientCountry}
                onChange={(e) => update("clientCountry", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Client rating (0-5)</label>
              <input
                value={form.clientRating}
                onChange={(e) => update("clientRating", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Client spend ($)</label>
              <input
                value={form.clientSpent}
                onChange={(e) => update("clientSpent", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Location requirement</label>
              <input
                value={form.locationRequirement}
                onChange={(e) => update("locationRequirement", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                checked={form.paymentVerified}
                onChange={(e) => update("paymentVerified", e.target.checked)}
                id="paymentVerified"
              />
              <label htmlFor="paymentVerified" className="text-xs text-muted">
                Payment verified
              </label>
            </div>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {result && (
            <div className="text-sm text-green-400">
              Analyzed — status: {result.status}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent text-white text-sm px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "ANALYZING..." : "ANALYZE"}
          </button>
        </form>
      )}
    </div>
  );
}
