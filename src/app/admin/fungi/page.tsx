import { getFungiList } from "@/app/actions/fungi";
import Link from "next/link";

export default async function FungiDirectoryPage() {
  const fungiList = await getFungiList();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Fungi Directory</h2>
          <p className="text-nature-600 mt-1">Manage core fungi entities and their relationships.</p>
        </div>
        <button className="bg-nature-600 hover:bg-nature-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-nature-600/20 transition-all hover:-translate-y-0.5 flexItems-center space-x-2">
          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Fungi
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-nature-100 shadow-sm overflow-hidden">
        {fungiList.length === 0 ? (
          <div className="p-12 text-center text-nature-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-nature-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="text-lg font-medium">No fungi records found</p>
            <p className="mt-1">Add your first fungi to the database to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nature-50/50 border-b border-nature-100 uppercase text-xs font-semibold text-nature-500 tracking-wider">
                <th className="px-6 py-4">Fungi</th>
                <th className="px-6 py-4">Scientific Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-100">
              {fungiList.map((fungus) => (
                <tr key={fungus.id} className="hover:bg-nature-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-nature-900">
                      {fungus.translations[0]?.name || fungus.slug}
                    </p>
                    <p className="text-xs text-nature-500 mt-0.5">{fungus.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-nature-600 italic">
                    {fungus.scientific_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      fungus.status === 'published' ? 'bg-green-100 text-green-700' :
                      fungus.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {fungus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/fungi/${fungus.id}`} className="text-nature-600 hover:text-nature-900 font-medium text-sm">
                      Edit Data
                    </Link>
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
