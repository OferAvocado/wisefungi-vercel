import { getBenefits, getConditions, getContraindications, getDoctorConsultFlags } from "@/app/actions/lookups";

export default async function TaxonomyPage() {
  const [benefits, conditions, contraindications, flags] = await Promise.all([
    getBenefits('en'),
    getConditions('en'),
    getContraindications('en'),
    getDoctorConsultFlags('en')
  ]);

  const cards = [
    { title: 'Benefits', items: benefits, type: 'benefits' },
    { title: 'Conditions', items: conditions, type: 'conditions' },
    { title: 'Contraindications', items: contraindications, type: 'contraindications' },
    { title: 'Doctor Consult Flags', items: flags, type: 'doctor_consult_flags' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Taxonomy Management</h2>
        <p className="text-nature-600 mt-2">Manage all the underlying dictionary classifications attached to Fungi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div key={card.type} className="bg-white rounded-2xl border border-nature-100 shadow-sm overflow-hidden flex flex-col h-96">
            <div className="px-6 py-4 border-b border-nature-100 bg-nature-50/30 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-nature-800">{card.title}</h3>
              <span className="bg-nature-100 text-nature-700 py-1 px-3 rounded-full text-xs font-medium">
                {card.items.length} items
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {card.items.length === 0 ? (
                 <p className="text-sm text-nature-400 text-center py-10 italic">No items yet</p>
              ) : (
                card.items.map((item: any) => (
                  <div key={item.id} className="p-3 border border-nature-50 rounded-xl bg-nature-50/10 flex justify-between items-center group hover:bg-nature-50 transition-colors">
                    <div>
                      <p className="font-medium text-nature-900">{item.translations[0]?.label || item.slug}</p>
                      <p className="text-xs text-nature-400 mt-0.5">{item.slug}</p>
                    </div>
                    <button className="text-nature-400 hover:text-nature-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-nature-100 bg-white">
               <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-nature-200 text-nature-500 hover:text-nature-700 hover:border-nature-400 hover:bg-nature-50 transition-all font-medium text-sm flex justify-center items-center">
                 <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 Add New {card.title.slice(0, -1)}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
