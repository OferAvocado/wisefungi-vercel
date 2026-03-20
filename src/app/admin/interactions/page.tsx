import { getInteractionItems } from "@/app/actions/lookups";

export default async function InteractionsPage() {
  const interactions = await getInteractionItems('en');

  const getTypeColor = (type: string) => {
    if (type === 'high_risk') return 'bg-red-100 text-red-700 border-red-200';
    if (type === 'moderate_interaction') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (type === 'helpful_combination') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Interactions Dictionary</h2>
          <p className="text-nature-600 mt-1">Manage cross-reactions with medications, herbs, and conditions.</p>
        </div>
        <button className="bg-nature-600 hover:bg-nature-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center space-x-2">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Add Interaction
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-nature-100 shadow-sm overflow-hidden">
        {interactions.length === 0 ? (
          <div className="p-12 text-center text-nature-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-nature-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg font-medium">No interactions defined</p>
            <p className="mt-1">Add items to reference later inside individual fungi profiles.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nature-50/50 border-b border-nature-100 uppercase text-xs font-semibold text-nature-500 tracking-wider">
                <th className="px-6 py-4">Interaction Label</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Target Category</th>
                <th className="px-6 py-4">Evidence Based</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-100">
              {interactions.map((node) => (
                <tr key={node.id} className="hover:bg-nature-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-nature-900">{node.translations[0]?.label || node.slug}</p>
                    <p className="text-xs text-nature-500">{node.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getTypeColor(node.interaction_type)}`}>
                      {node.interaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-nature-700 text-sm">
                    {node.target_type}
                  </td>
                  <td className="px-6 py-4 capitalize text-nature-700 text-sm">
                    {node.evidence_level.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-nature-600 hover:text-nature-900 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
