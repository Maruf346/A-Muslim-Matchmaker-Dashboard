import { useState } from "react";

type LeadStatus = "New Match" | "Photos Revealed" | "Contact Shared" | "In Discussion" | "Married" | "Dropped";

interface Lead {
  id: number;
  groom: string;
  bride: string;
  status: LeadStatus;
}

const mockLeads: Lead[] = [
  { id: 1, groom: "Mohammed Ali", bride: "Sarah Ahmed", status: "Contact Shared" },
  { id: 2, groom: "Ahmed Hassan", bride: "Fatima Khan", status: "Photos Revealed" },
  { id: 3, groom: "Omar Farooq", bride: "Aisha Rahman", status: "New Match" },
  { id: 4, groom: "Ibrahim Yusuf", bride: "Zainab Malik", status: "In Discussion" },
  { id: 5, groom: "Ali Khan", bride: "Maryam Ali", status: "Contact Shared" },
  { id: 6, groom: "Hassan Ahmed", bride: "Layla Hassan", status: "Married" },
  { id: 7, groom: "Yusuf Omar", bride: "Khadija Ali", status: "New Match" },
  { id: 8, groom: "Bilal Ahmed", bride: "Hafsa Khan", status: "Dropped" },
];

const stages: LeadStatus[] = ["New Match", "Photos Revealed", "Contact Shared", "In Discussion", "Married", "Dropped"];

const stageColors: Record<LeadStatus, string> = {
  "New Match": "bg-[#ACB5DA]/30 border-[#ACB5DA]",
  "Photos Revealed": "bg-[#ECCBCE]/30 border-[#ECCBCE]",
  "Contact Shared": "bg-[#D07C84]/30 border-[#D07C84]",
  "In Discussion": "bg-[#ACB5DA]/50 border-[#415192]",
  "Married": "bg-[#415192]/20 border-[#415192]",
  "Dropped": "bg-gray-50 border-gray-200",
};

export function Leads() {
  const [leads] = useState<Lead[]>(mockLeads);

  const getLeadsByStage = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

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
          const stageLeads = getLeadsByStage(stage);

          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Column Header */}
                <div className={`p-4 border-b ${stageColors[stage]}`}>
                  <h3 className="font-semibold text-gray-900">{stage}</h3>
                  <p className="text-sm text-gray-500 mt-1">{stageLeads.length} matches</p>
                </div>

                {/* Cards Container */}
                <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No matches in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white text-sm">
                            {lead.groom.charAt(0)}
                          </div>
                          <div className="text-lg text-gray-400">+</div>
                          <div className="w-10 h-10 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-sm">
                            {lead.bride.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.groom}</p>
                          <p className="text-sm text-gray-500">&</p>
                          <p className="text-sm font-medium text-gray-900">{lead.bride}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">Match #{lead.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
