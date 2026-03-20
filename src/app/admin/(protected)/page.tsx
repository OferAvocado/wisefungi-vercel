import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const fungiCount = await prisma.fungi.count();
  const translationsCount = await prisma.fungiTranslation.count();
  const benefitsCount = await prisma.benefit.count();
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-nature-600 mt-2">Welcome to your WiseFungi management portal.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-nature-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-nature-100 text-nature-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <h3 className="text-nature-500 text-sm font-medium uppercase tracking-wider">Total Fungi</h3>
            <p className="text-4xl font-bold text-nature-900 mt-1">{fungiCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-nature-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          </div>
          <div>
            <h3 className="text-nature-500 text-sm font-medium uppercase tracking-wider">Translations</h3>
            <p className="text-4xl font-bold text-nature-900 mt-1">{translationsCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-nature-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <div>
            <h3 className="text-nature-500 text-sm font-medium uppercase tracking-wider">Recorded Benefits</h3>
            <p className="text-4xl font-bold text-nature-900 mt-1">{benefitsCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-nature-100 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-nature-100 bg-nature-50/50">
          <h3 className="text-lg font-semibold text-nature-800">System Ready</h3>
        </div>
        <div className="p-6">
          <p className="text-nature-600">
            The WiseFungi structure is initialized. Access the sidebar to manage your Fungi database, multi-lingual content, and related entities like Benefits, Conditions and Contraindications.
          </p>
        </div>
      </div>
    </div>
  );
}
