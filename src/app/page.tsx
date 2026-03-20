export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-nature-100 to-nature-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center border border-nature-200">
          <h1 className="text-5xl font-bold text-nature-800 mb-6 font-sans">
            Wise Fungi
          </h1>
          <p className="text-xl text-nature-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your Vercel-ready system is initialized. The database structure has been translated into a complete Prisma schema, featuring full multilingual support, benefits, conditions, contraindications, and interaction mappings.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
            <div className="bg-nature-50 p-6 rounded-2xl border border-nature-100">
              <h3 className="font-semibold text-lg text-nature-700 mb-2">1. Connect Database</h3>
              <p className="text-nature-600">Link your Vercel Postgres database and update the .env file.</p>
            </div>
            <div className="bg-nature-50 p-6 rounded-2xl border border-nature-100">
              <h3 className="font-semibold text-lg text-nature-700 mb-2">2. Push Schema</h3>
              <p className="text-nature-600">Run `npx prisma db push` to synchronize the schema.</p>
            </div>
            <div className="bg-nature-50 p-6 rounded-2xl border border-nature-100">
              <h3 className="font-semibold text-lg text-nature-700 mb-2">3. Build Admin UI</h3>
              <p className="text-nature-600">Start developing routes leveraging the full relational model.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
