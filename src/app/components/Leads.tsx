import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { listMatches, type AdminMatchListItem, type AdminMatchPersonSummary } from "../api/matches";
import { ApiError } from "../api/errors";
import { LEAD_STAGE_COLORS, LEAD_STAGE_CONFIGS, type LeadStageKey } from "../data/leadStages";

type StageState = {
  count: number;
  items: AdminMatchListItem[];
};

function getPersonName(person: AdminMatchPersonSummary) {
  return person.full_name?.trim() || person.codename?.trim() || "Unknown";
}

function getPersonInitials(person: AdminMatchPersonSummary) {
  const name = getPersonName(person);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function PersonAvatar({
  person,
  colorClass,
}: {
  person: AdminMatchPersonSummary;
  colorClass: string;
}) {
  const name = getPersonName(person);

  return (
    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white text-sm shrink-0 overflow-hidden`}>
      {person.profile_picture ? (
        <img src={person.profile_picture} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getPersonInitials(person)}</span>
      )}
    </div>
  );
}

export function Leads() {
  const [stages, setStages] = useState<Record<LeadStageKey, StageState>>({
    "new-match": { count: 0, items: [] },
    "photos-revealed": { count: 0, items: [] },
    "in-discussion": { count: 0, items: [] },
    married: { count: 0, items: [] },
    dropped: { count: 0, items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const loadStages = async () => {
      setLoading(true);
      setError(null);

      try {
        const responses = await Promise.all(
          LEAD_STAGE_CONFIGS.map(async (config) => {
            const response = await listMatches({
              ...config.filters,
              page: 1,
              page_size: 3,
            });

            return {
              key: config.key,
              count: response.count ?? 0,
              items: response.results ?? [],
            };
          }),
        );

        setStages((prev) => {
          const next = { ...prev };

          for (const response of responses) {
            next[response.key] = {
              count: response.count,
              items: response.items,
            };
          }

          return next;
        });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load leads pipeline.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadStages();
  }, [reloadIndex]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Leads Pipeline</h1>
        <p className="text-gray-500 mt-1">Track match progress through stages</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-sm text-gray-500 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
          Loading leads pipeline...
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Could not load leads pipeline</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => setReloadIndex((prev) => prev + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STAGE_CONFIGS.map((stage) => {
            const current = stages[stage.key];
            const displayLeads = current.items.slice(0, 3);

            return (
              <div key={stage.key} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className={`p-4 border-b ${LEAD_STAGE_COLORS[stage.label]}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                      <span className="text-xs font-medium text-gray-600 bg-white/70 px-2 py-0.5 rounded-full">
                        {current.count}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {displayLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No matches in this stage
                      </div>
                    ) : (
                      displayLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <PersonAvatar person={lead.groom} colorClass="bg-[#415192]" />
                            <div className="text-lg text-gray-400">+</div>
                            <PersonAvatar person={lead.bride} colorClass="bg-[#D07C84]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getPersonName(lead.groom)}</p>
                            <p className="text-sm text-gray-500">&</p>
                            <p className="text-sm font-medium text-gray-900">{getPersonName(lead.bride)}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">{lead.match_id || "-"}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    to={`/leads/${stage.key}`}
                    className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[#415192] hover:bg-[#415192]/5 transition-colors border-t border-gray-100"
                  >
                    View All ({current.count})
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
