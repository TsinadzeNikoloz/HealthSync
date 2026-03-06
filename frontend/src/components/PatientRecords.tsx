
import React, { useState } from 'react';
import Pagination from './ui/Pagination';
import ConfirmModal from './ui/ConfirmModal';
import { getUserPhotoUrl } from '../utils/helpers';
import { Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useUsers } from '../features/users/useUsers';
import { useDeleteUser } from '../features/users/useDeleteUser';
import { useUpdateUser } from '../features/users/useUpdateUser';

const PatientRecords: React.FC = () => {
  const { user: currentUser } = useUser();
  const { users, count } = useUsers();
  const { deleteUser } = useDeleteUser();
  const { updateUserField, isUpdating } = useUpdateUser();

  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  // Filter users based on search input (Name or Email)
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: Role) => {
    updateUserField({ id: userId, updates: { role: newRole } });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setPendingDelete({ id: userId, name: userName });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-2 font-medium">Control access levels and manage clinic staff/patients.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm font-semibold text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modify Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={getUserPhotoUrl(user.photo, user.name)}
                            className="w-12 h-12 rounded-2xl border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                            alt=""
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${user.role === Role.ADMIN ? 'bg-rose-500' : user.role === Role.DOCTOR ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">ID: #{user.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{user.phone || 'No Phone Linked'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        user.role === Role.ADMIN ? 'bg-rose-50 text-rose-600' :
                        user.role === Role.DOCTOR ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative w-40">
                        <select
                          value={user.role}
                          disabled={isUpdating || user.id === currentUser?.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-700 uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value={Role.PATIENT}>Patient</option>
                          <option value={Role.DOCTOR}>Doctor</option>
                          <option value={Role.ADMIN}>Admin</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center ml-auto"
                          title="Delete User"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic pr-2">Self Account</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
          <Pagination count={count} />
        </div>
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Remove User"
          message={`Are you absolutely sure you want to remove ${pendingDelete.name}? This action cannot be undone.`}
          confirmLabel="Remove"
          onConfirm={() => { deleteUser(pendingDelete.id); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

export default PatientRecords;
