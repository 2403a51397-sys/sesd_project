import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, CheckCircle, XCircle, ShieldCheck, UserCheck, Search, Trash2, Clock, AlertCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.listUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    try {
      await api.updateUserStatus(user.id, nextStatus);
      setActionSuccess(`User ${user.email} status updated to ${nextStatus ? 'Active' : 'Pending/Suspended'}`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadUsers();
    } catch (err) {
      setError(err?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove user ${email}?`)) return;
    try {
      await api.deleteUser(id);
      setActionSuccess(`User ${email} removed.`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadUsers();
    } catch (err) {
      setError(err?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole =
      filterRole === 'ALL'
        ? true
        : filterRole === 'PENDING'
        ? u.role === 'trainer' && !u.is_active
        : u.role === filterRole.toLowerCase();

    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);

    return matchesRole && matchesSearch;
  });

  const pendingCount = users.filter((u) => u.role === 'trainer' && !u.is_active).length;

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900 font-display">
              FitSphere User Governance &amp; Trainer Approvals
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated accounts, review coaching applications, and grant system permissions.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Trainer Application(s) Awaiting Approval</span>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          {['ALL', 'PENDING', 'ADMIN', 'TRAINER', 'CLIENT'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterRole(f)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRole === f
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'PENDING' && pendingCount > 0 ? `Pending (${pendingCount})` : f}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 font-mono">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isPending = u.role === 'trainer' && !u.is_active;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(u.full_name || 'U').charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'trainer'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {u.role === 'client' ? 'Customer' : u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Review
                        </span>
                      ) : u.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      <div>{u.phone || 'No phone'}</div>
                      <div className="text-slate-400 text-[10px]">{u.address || 'Standard Access'}</div>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                      {(u.created_at || '').substring(0, 10)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve Coach</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-all cursor-pointer"
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}

                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
