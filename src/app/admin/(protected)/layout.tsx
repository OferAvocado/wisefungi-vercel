import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-nature-50">
      <aside className="w-64 bg-white border-r border-nature-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-nature-100">
          <h1 className="text-2xl font-bold text-nature-800 tracking-tight">WiseFungi</h1>
          <p className="text-xs text-nature-500 mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/admin/fungi" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
            Fungi Directory
          </Link>
          <Link href="/admin/translations" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
            Translations
          </Link>
          <div className="pt-4 mt-4 border-t border-nature-100">
            <h3 className="px-4 text-xs font-semibold text-nature-400 uppercase tracking-wider mb-2">Dictionaries</h3>
            <Link href="/admin/taxonomy" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
              Taxonomies
            </Link>
            <Link href="/admin/interactions" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
              Interactions
            </Link>
          </div>
          <div className="pt-4 mt-4 border-t border-nature-100">
            <h3 className="px-4 text-xs font-semibold text-nature-400 uppercase tracking-wider mb-2">System</h3>
            <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-nature-700 hover:bg-nature-100 hover:text-nature-900 transition-colors font-medium">
              Administrators
            </Link>
          </div>
        </nav>
        
        <div className="p-4 border-t border-nature-100 bg-nature-50/50">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-nature-600 flex items-center justify-center text-white font-bold text-sm">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-nature-900">{session.user?.name}</p>
              <p className="text-xs text-nature-500 capitalize">{session.user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
