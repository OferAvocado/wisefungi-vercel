import { getAdmins } from "@/app/actions/admins";

export default async function AdminUsersPage() {
  const admins = await getAdmins();

  const getRoleColor = (role: string) => {
    if (role === 'super_admin') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'editor') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role === 'translator') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-nature-900 tracking-tight">System Administrators</h2>
          <p className="text-nature-600 mt-1">Manage team access, permissions, and status.</p>
        </div>
        <button className="bg-nature-600 hover:bg-nature-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center space-x-2">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Invite Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-nature-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nature-50/50 border-b border-nature-100 uppercase text-xs font-semibold text-nature-500 tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nature-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-nature-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-nature-100 flex items-center justify-center text-nature-700 font-bold">
                      {admin.full_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-nature-900">{admin.full_name}</p>
                      <p className="text-sm text-nature-500">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getRoleColor(admin.role)}`}>
                    {admin.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-nature-600 text-sm">
                  {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-nature-600 hover:text-nature-900 font-medium text-sm">Edit</button>
                  <button className={`${admin.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} font-medium text-sm`}>
                    {admin.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
