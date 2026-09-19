export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatAge(minutes: number | null): string {
  if (minutes === null) return "unknown";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatProposals(min: number | null, max: number | null): string {
  if (min === null && max === null) return "unknown";
  if (min !== null && max === null) return `${min}+`;
  if (min === 0 && max !== null) return `<${max + 1}`;
  if (min !== null && max !== null) return `${min}-${max}`;
  return "unknown";
}

export function formatBudget(job: {
  budgetMin: number | null;
  budgetMax: number | null;
  hourlyMin: number | null;
  hourlyMax: number | null;
  currency: string | null;
}): string {
  const currency = job.currency ?? "$";
  if (job.hourlyMin !== null || job.hourlyMax !== null) {
    return `${currency}${job.hourlyMin ?? "?"}-${currency}${job.hourlyMax ?? "?"}/hr`;
  }
  if (job.budgetMin !== null || job.budgetMax !== null) {
    return `${currency}${job.budgetMin ?? "?"}-${currency}${job.budgetMax ?? "?"}`;
  }
  return "not specified";
}
