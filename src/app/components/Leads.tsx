import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { mockLeads, LeadStatus } from "../data/mockLeads";

const stages: LeadStatus[] = [
  "New Match",
  "Photos Revealed",
  "In Discussion",
  "Married",
  "Dropped",
];

const stageColors: Record<LeadStatus, string> = {
  "New Match":       "bg-[#ACB5DA]/30 border-[#ACB5DA]",
  "Photos Revealed": "bg-[#ECCBCE]/30 border-[#ECCBCE]",
  "In Discussion":   "bg-[#ACB5DA]/50 border-[#415192]",
  "Married":         "bg-[#415192]/20 border-[#415192]",
  "Dropped":         "bg-gray-50 border-gray-200",
};

function stageToSlug(stage: LeadStatus): string {
  return stage.toLowerCase().replace(/ /g, "-");
}

export function Leads() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Leads Pipeline</h1>
        <p className="text-gray-500 mt-1">Track match progress through stages</p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const allStageLeads = mockLeads.filter((l) => l.status === stage);
          const displayLeads  = allStageLeads.slice(0, 3);

          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Column Header */}
                <div className={`p-4 border-b ${stageColors[stage]}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{stage}</h3>
                    <span className="text-xs font-medium text-gray-600 bg-white/70 px-2 py-0.5 rounded-full">
                      {allStageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
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
                          <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white text-sm shrink-0">
                            {lead.groom.charAt(0)}
                          </div>
                          <div className="text-lg text-gray-400">+</div>
                          <div className="w-10 h-10 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-sm shrink-0">
                            {lead.bride.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.groom}</p>
                          <p className="text-sm text-gray-500">&</p>
                          <p className="text-sm font-medium text-gray-900">{lead.bride}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            Lead #{lead.id.toString().padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* View All */}
                <Link
                  to={`/leads/${stageToSlug(stage)}`}
                  className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[#415192] hover:bg-[#415192]/5 transition-colors border-t border-gray-100"
                >
                  View All ({allStageLeads.length})
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
