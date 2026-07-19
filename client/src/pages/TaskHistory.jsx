import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiActivity, FiUser } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const TaskHistory = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      // Filter ONLY completed tasks
      setTasks(response.data.filter(t => t.status === 'Completed'));
    } catch (error) {
      toast.error('Failed to fetch task history');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks(); // Refresh list (will filter out if no longer Completed)
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-mono text-indigo-400">RESOLVING ARCHIVE RECORDS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FiActivity className="text-indigo-500" /> History Ledger
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {isAdmin 
            ? 'Review the archive of completed operations across all node assignees.' 
            : 'Review your resolved operation records and duration metrics.'}
        </p>
      </div>

      {/* Grid of Completed Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full bg-slate-900/20 backdrop-blur-md p-12 text-center rounded-2xl border border-slate-900 text-slate-500">
            No completed operations logged in the history ledger.
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900/80 shadow-xl flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500 glass-card-hover"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-white text-base leading-snug line-through opacity-60">{task.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <FiCheckCircle size={10} /> Completed
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description || 'No detailed parameters supplied.'}</p>
              </div>

              <div className="pt-4 border-t border-slate-950/60 flex flex-col gap-3">
                {/* Meta details */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <FiClock /> Resolved: {dayjs(task.updatedAt).format('MMM DD, YYYY')}
                  </span>
                  <span>
                    Est: {task.estimatedDuration}h / Act: <span className="text-emerald-400 font-semibold">{task.actualDuration}h</span>
                  </span>
                </div>

                {isAdmin && task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="text-[10px] bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-900/40 text-slate-400 truncate flex items-center gap-1.5">
                    <FiUser className="text-slate-500" size={12} />
                    <span className="font-semibold text-slate-500">Nodes: </span>
                    {task.assignedTo.map(u => u.name).join(', ')}
                  </div>
                )}

                {/* Status Switcher (allows reverting to Active if needed) */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Reopen Operation</span>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none text-slate-400 cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">Reopen to In Progress</option>
                    <option value="Review">Reopen to Review</option>
                    <option value="Not Started">Reopen to Not Started</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskHistory;
