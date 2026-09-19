"use client";

import { useState } from "react";

export interface SettingsData {
  minimumMatch: number;
  fastMatchMinimum: number;
  hiddenMatchMinimum: number;
  maximumFastAgeMinutes: number;
  maximumHiddenAgeMinutes: number;
  maximumFastProposals: number;
  maximumHiddenProposals: number;
  minimumHourly: number | null;
  minimumFixedBudget: number | null;
  telegramEnabled: boolean;
  aiProvider: string;
}

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 max-w-2xl space-y-4">
      <NumberField label="Minimum match" value={form.minimumMatch} onChange={(v) => update("minimumMatch", v === "" ? 0 : v)} />
      <NumberField label="Fast match threshold" value={form.fastMatchMinimum} onChange={(v) => update("fastMatchMinimum", v === "" ? 0 : v)} />
      <NumberField label="Hidden match threshold" value={form.hiddenMatchMinimum} onChange={(v) => update("hiddenMatchMinimum", v === "" ? 0 : v)} />
      <NumberField label="Fast max age (minutes)" value={form.maximumFastAgeMinutes} onChange={(v) => update("maximumFastAgeMinutes", v === "" ? 0 : v)} />
      <NumberField label="Hidden max age (minutes)" value={form.maximumHiddenAgeMinutes} onChange={(v) => update("maximumHiddenAgeMinutes", v === "" ? 0 : v)} />
      <NumberField label="Fast max proposals" value={form.maximumFastProposals} onChange={(v) => update("maximumFastProposals", v === "" ? 0 : v)} />
      <NumberField label="Hidden max proposals" value={form.maximumHiddenProposals} onChange={(v) => update("maximumHiddenProposals", v === "" ? 0 : v)} />
      <NumberField
        label="Minimum hourly rate"
        value={form.minimumHourly ?? ""}
        onChange={(v) => update("minimumHourly", v === "" ? null : v)}
      />
      <NumberField
        label="Minimum fixed budget"
        value={form.minimumFixedBudget ?? ""}
        onChange={(v) => update("minimumFixedBudget", v === "" ? null : v)}
      />

      <div>
        <label className="text-xs text-muted block mb-1">AI provider</label>
        <select
          value={form.aiProvider}
          onChange={(e) => update("aiProvider", e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama (local)</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="telegramEnabled"
          checked={form.telegramEnabled}
          onChange={(e) => update("telegramEnabled", e.target.checked)}
        />
        <label htmlFor="telegramEnabled" className="text-sm">
          Telegram notifications enabled
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-accent text-white text-sm px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
