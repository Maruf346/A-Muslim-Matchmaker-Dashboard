import type { AdminMatchesListParams, AdminMatchStatus } from "../api/matches";

export type LeadStageKey = "new-match" | "photos-revealed" | "in-discussion" | "married" | "dropped";

export type LeadStageLabel = "New Match" | "Photos Revealed" | "In Discussion" | "Married" | "Dropped";

export interface LeadStageConfig {
  key: LeadStageKey;
  label: LeadStageLabel;
  filters: AdminMatchesListParams;
}

function statusFilters(status: AdminMatchStatus): AdminMatchesListParams {
  return { status };
}

export const LEAD_STAGE_CONFIGS: LeadStageConfig[] = [
  {
    key: "new-match",
    label: "New Match",
    filters: { recent: true },
  },
  {
    key: "photos-revealed",
    label: "Photos Revealed",
    filters: { photos_revealed: true },
  },
  {
    key: "in-discussion",
    label: "In Discussion",
    filters: statusFilters("in_discussion"),
  },
  {
    key: "married",
    label: "Married",
    filters: statusFilters("married"),
  },
  {
    key: "dropped",
    label: "Dropped",
    filters: statusFilters("dropped"),
  },
];

export const LEAD_STAGE_BY_KEY: Record<LeadStageKey, LeadStageConfig> = LEAD_STAGE_CONFIGS.reduce(
  (accumulator, config) => {
    accumulator[config.key] = config;
    return accumulator;
  },
  {} as Record<LeadStageKey, LeadStageConfig>,
);

export const LEAD_STAGE_COLORS: Record<LeadStageLabel, string> = {
  "New Match": "bg-[#ACB5DA]/30 border-[#ACB5DA]",
  "Photos Revealed": "bg-[#ECCBCE]/30 border-[#ECCBCE]",
  "In Discussion": "bg-[#ACB5DA]/50 border-[#415192]",
  Married: "bg-[#415192]/20 border-[#415192]",
  Dropped: "bg-gray-50 border-gray-200",
};
