import { getFungusById } from "@/app/actions/fungi";
import { getBenefits, getConditions } from "@/app/actions/lookups";

export default async function FungiEditPage({ params }: { params: { id: string } }) {
  const fungus = await getFungusById(params.id);
  const allBenefits = await getBenefits('en');
  const allConditions = await getConditions('en');

  if (!fungus) {
    return <div>Fungus not found</div>;
  }

  // Pre-calculate what is mapped
  const mappedBenefitIds = fungus.benefits.map(b => b.benefit_id);
  const mappedConditionIds = fungus.conditions.map(c => c.condition_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Edit: {fungus.scientific_name}</h2>
          <p className="text-nature-600 mt-1">Manage core details, languages, and relationships.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core details generic placeholder for now */}
        <div className="col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-nature-100 shadow-sm p-8">
             <h3 className="text-xl font-bold text-nature-800 mb-6">Taxonomy Relationships</h3>
             
             <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-nature-900 mb-2">Key Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {allBenefits.map(benefit => {
                      const isSelected = mappedBenefitIds.includes(benefit.id);
                      return (
                        <div key={benefit.id} className={`px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors ${isSelected ? 'bg-nature-600 text-white border-nature-600' : 'bg-white text-nature-600 border-nature-200 hover:border-nature-400'}`}>
                          {benefit.translations[0]?.label || benefit.slug}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-nature-100">
                  <h4 className="font-semibold text-nature-900 mb-2">Medical Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {allConditions.map(condition => {
                      const isSelected = mappedConditionIds.includes(condition.id);
                      return (
                        <div key={condition.id} className={`px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors ${isSelected ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:border-orange-400'}`}>
                          {condition.translations[0]?.label || condition.slug}
                        </div>
                      )
                    })}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-1 border border-nature-100 bg-nature-50/50 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-nature-900 mb-4">Metadata Status</h3>
          <ul className="space-y-3 text-sm text-nature-700">
            <li className="flex justify-between border-b border-nature-200/50 pb-2">
                <span>Status</span>
                <span className="capitalize font-medium text-nature-900">{fungus.status}</span>
            </li>
            <li className="flex justify-between border-b border-nature-200/50 pb-2">
                <span>Translations</span>
                <span className="font-medium text-nature-900">{fungus.translations.length} / 4</span>
            </li>
            <li className="flex justify-between border-b border-nature-200/50 pb-2">
                <span>Linked Benefits</span>
                <span className="font-medium text-nature-900">{fungus.benefits.length}</span>
            </li>
            <li className="flex justify-between border-b border-nature-200/50 pb-2">
                <span>Linked Conditions</span>
                <span className="font-medium text-nature-900">{fungus.conditions.length}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
