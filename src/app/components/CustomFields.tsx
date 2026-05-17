import { Plus, Edit, Trash2, ToggleLeft } from "lucide-react";

const mockFields = [
  { id: 1, name: "Visa Status", type: "Dropdown", required: true, options: ["Citizen", "PR", "Work Visa", "Student Visa"] },
  { id: 2, name: "Family Type", type: "Dropdown", required: true, options: ["Joint Family", "Nuclear Family", "Extended Family"] },
  { id: 3, name: "Dietary Preference", type: "Text", required: false, options: [] },
  { id: 4, name: "Languages Spoken", type: "Multi-select", required: true, options: ["English", "Arabic", "Urdu", "Hindi"] },
  { id: 5, name: "Willing to Relocate", type: "Yes/No", required: true, options: [] },
];

export function CustomFields() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Custom Fields</h1>
          <p className="text-gray-500 mt-1">Manage profile fields and options</p>
        </div>
        <button className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Field
        </button>
      </div>

      {/* Fields List */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{field.name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {field.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.required ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {field.options.slice(0, 3).map((option, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                            {option}
                          </span>
                        ))}
                        {field.options.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-500">
                            +{field.options.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No options</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Toggle Required">
                        <ToggleLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-[#ACB5DA]/20 border border-[#ACB5DA] rounded-lg p-4">
        <p className="text-sm text-[#415192]">
          <strong>Note:</strong> Custom fields allow you to capture additional information from users during registration.
          These fields can be marked as required or optional and will appear in the user profile form.
        </p>
      </div>
    </div>
  );
}
