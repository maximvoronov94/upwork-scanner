import maxProfile from "@/data/max-profile.json";

export interface MaxProfile {
  name: string;
  portfolio: string;
  skills: Record<string, string[]>;
  projects: {
    name: string;
    description: string;
    bestFor: string[];
    url?: string;
  }[];
  weakOrUnverified: string[];
}

export function getMaxProfile(): MaxProfile {
  return maxProfile as MaxProfile;
}
