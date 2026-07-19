import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiTrash2, FiAlertCircle, FiSettings, FiActivity } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.filter(t => t.status !== 'Completed'));
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const onSubmitTask = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        estimatedDuration: Number(data.estimatedDuration),
        deadline: data.deadline,
        assignedTo: isAdmin ? [data.assignedTo] : [userInfo._id], 
      };

      await api.post('/tasks', payload);
      toast.success('Task logged successfully');
      setShowAddModal(false);
      reset();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'Completed': return 'border-l-4 border-l-emerald-500';
      case 'In Progress': return 'border-l-4 border-l-amber-500';
      case 'Review': return 'border-l-4 border-l-purple-500';
      default: return 'border-l-4 border-l-slate-600';
    }
  };

  const handleOpenAddModal = () => {
    if (isAdmin) {
      fetchUsers();
    }
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-mono text-indigo-400">LOADING OPERATIONS LEDGER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiActivity className="text-indigo-500" /> Operations Ledger
          </div>
          <p className="text-sm text-slate-400 mt-1">Manage and update task flows assigned across nodes.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-950/30"
        >
          + Log Operation
        </button>
      </div>

      {/* Grid Layout of Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full bg-slate-900/20 backdrop-blur-md p-12 text-center rounded-2xl border border-slate-900 text-slate-500">
            No active operations currently logged in the ledger.
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className={`bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900/80 shadow-xl flex flex-col justify-between gap-4 glass-card-hover ${getStatusBorder(task.status)}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-white text-base leading-snug">{task.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description || 'No detailed parameters supplied for this operation.'}</p>
              </div>

              <div className="pt-4 border-t border-slate-950/60 flex flex-col gap-3">
                {/* Meta details */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <FiClock /> Due: {dayjs(task.deadline).format('MMM DD, YYYY')}
                  </span>
                  <span>
                    Est: {task.estimatedDuration}h / Act: <span className={task.actualDuration > task.estimatedDuration ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>{task.actualDuration}h</span>
                  </span>
                </div>

                {isAdmin && task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="text-[10px] bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-900/40 text-slate-400 truncate">
                    <span className="font-semibold text-slate-500">Nodes: </span>
                    {task.assignedTo.map(u => u.name).join(', ')}
                  </div>
                )}

                {/* Status Switcher */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Status Node</span>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none text-slate-300 cursor-pointer"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-white">Configure Operation</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition"><FiAlertCircle size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmitTask)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    defaultValue="General"
                    {...register('category')}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Deadline</label>
                  <input
                    type="date"
                    {...register('deadline', { required: 'Deadline is required' })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Est. Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('estimatedDuration', { required: 'Required' })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-400 uppercase mb-1">Assign to Member</label>
                  <select
                    {...register('assignedTo', { required: 'Assign to a member' })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm cursor-pointer"
                  >
                    <option value="">Select Member...</option>
                    {userInfo.email !== 'admin@example.com' && (
                      <option value={userInfo._id || userInfo.id}>Myself ({userInfo.name || 'Admin'})</option>
                    )}
                    {users.filter(u => u._id !== (userInfo._id || userInfo.id)).map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  {errors.assignedTo && <p className="text-rose-500 text-xs mt-1">{errors.assignedTo.message}</p>}
                </div>
              )}

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
                  Deploy Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
