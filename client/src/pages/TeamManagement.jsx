import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { FiUsers, FiUserPlus, FiShield, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/create', data);
      setCreatedUserData(data); // Save credentials so the admin can manually copy them
      setShowAddModal(false);
      reset();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the network registry?`)) {
      try {
        await api.delete(`/auth/users/${userId}`);
        toast.success(`User ${userName} deleted successfully`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-mono text-indigo-400">RESOLVING NETWORK REGISTRY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiUsers className="text-indigo-500" /> Team Registry
          </div>
          <p className="text-sm text-slate-400 mt-1">Configure access nodes, review security roles, and invite contributors.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-950/30 flex items-center gap-2"
        >
          <FiUserPlus /> Add Node
        </button>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col justify-between gap-6 glass-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <h3 className="font-bold text-white truncate text-base">{user.name}</h3>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <FiShield className="text-indigo-500" />
                <span className="font-mono uppercase text-[10px] tracking-wider font-semibold">{user.role}</span>
              </div>
              <div className="flex items-center gap-3">
                {userInfo._id !== user._id && (
                  <button 
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="text-slate-500 hover:text-rose-500 transition-colors p-1 rounded-md bg-slate-950/40 border border-slate-900"
                    title="Delete User"
                  >
                    <FiTrash2 size={13} />
                  </button>
                )}
                <span className="text-[10px] text-slate-600 font-mono">
                  node_sys: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-white">Deploy Node</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition"><FiAlertTriangle size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Temporary Security Code (Password)</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                />
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Network Role</label>
                <select
                  {...register('role')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm text-slate-300"
                >
                  <option value="member">Member (Limited Node)</option>
                  <option value="admin">Administrator (Full Node)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-indigo-950/40"
                >
                  Deploy Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {createdUserData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-500/20">
                ✓
              </div>
              <h2 className="text-xl font-extrabold text-white">Node Deployed Successfully!</h2>
              <p className="text-xs text-slate-400">
                Node has been successfully deployed in the registry! Please manually copy these credentials to share with the team member:
              </p>
            </div>
            
            <div className="mt-6 bg-slate-950/80 p-4 rounded-xl border border-slate-900 space-y-3 font-mono text-xs text-left">
              <div>
                <span className="text-slate-500">Name:</span> <span className="text-slate-200">{createdUserData.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span> <span className="text-slate-200">{createdUserData.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Password:</span> <span className="text-emerald-400 font-semibold">{createdUserData.password}</span>
              </div>
              <div>
                <span className="text-slate-500">Role:</span> <span className="text-indigo-400 capitalize">{createdUserData.role || 'member'}</span>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCreatedUserData(null)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-emerald-950/40"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
