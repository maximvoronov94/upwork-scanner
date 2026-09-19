import { getOrCreateSettings } from "@/lib/jobs/analyzer";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getOrCreateSettings();

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Settings</h1>
      <SettingsForm
        initial={{
          minimumMatch: settings.minimumMatch,
          fastMatchMinimum: settings.fastMatchMinimum,
          hiddenMatchMinimum: settings.hiddenMatchMinimum,
          maximumFastAgeMinutes: settings.maximumFastAgeMinutes,
          maximumHiddenAgeMinutes: settings.maximumHiddenAgeMinutes,
          maximumFastProposals: settings.maximumFastProposals,
          maximumHiddenProposals: settings.maximumHiddenProposals,
          minimumHourly: settings.minimumHourly,
          minimumFixedBudget: settings.minimumFixedBudget,
          telegramEnabled: settings.telegramEnabled,
          aiProvider: settings.aiProvider,
        }}
      />
    </div>
  );
}
