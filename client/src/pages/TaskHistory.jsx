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

      {/* Table of Completed Tasks */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {tasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl text-slate-500 font-mono text-xs">
              No completed operations logged in the history ledger.
            </div>
          ) : (
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/50 text-[12px] font-bold font-mono tracking-wider text-slate-500 uppercase">
                  <th scope="col" className="px-8 py-5">Operation Title</th>
                  <th scope="col" className="px-6 py-5">Description</th>
                  <th scope="col" className="px-6 py-5">Resolved Date</th>
                  <th scope="col" className="px-6 py-5 text-center">Est. Hrs</th>
                  <th scope="col" className="px-6 py-5 text-center">Act. Hrs</th>
                  {isAdmin && <th scope="col" className="px-6 py-5">Assigned Nodes</th>}
                  <th scope="col" className="px-6 py-5 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-950/40 text-xs">
                {tasks.map((task) => {
                  return (
                    <tr key={task._id} className="hover:bg-slate-900/10 transition">
                      {/* Title */}
                      <td className="px-8 py-5 font-bold text-slate-200 line-through opacity-50 font-mono max-w-xs truncate" title={task.title}>
                        {task.title}
                      </td>
                      {/* Description */}
                      <td className="px-6 py-5 text-slate-400 max-w-xs truncate" title={task.description}>
                        {task.description || 'No detailed parameters supplied.'}
                      </td>
                      {/* Resolved Date */}
                      <td className="px-6 py-5 text-slate-400 font-mono">
                        {dayjs(task.updatedAt).format('MMM DD, YYYY')}
                      </td>
                      {/* Est. Hrs */}
                      <td className="px-6 py-5 font-mono text-slate-400 text-center">
                        {task.estimatedDuration}h
                      </td>
                      {/* Act. Hrs */}
                      <td className="px-6 py-5 font-mono text-emerald-400 font-semibold text-center">
                        {task.actualDuration}h
                      </td>
                      {/* Assigned Nodes */}
                      {isAdmin && (
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {task.assignedTo && task.assignedTo.length > 0 ? (
                              task.assignedTo.map((u) => {
                                const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
                                return (
                                  <div 
                                    key={u._id} 
                                    className="w-6 h-6 rounded-md bg-slate-950/60 border border-slate-900 flex items-center justify-center text-[10px] text-slate-300 font-mono"
                                    title={`${u.name} (${u.email})`}
                                  >
                                    {initial}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </div>
                        </td>
                      )}
                      {/* Reopen Action */}
                      <td className="px-6 py-5 text-right pr-8">
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className="text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none text-slate-400 cursor-pointer"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">Reopen: In Progress</option>
                          <option value="Review">Reopen: Review</option>
                          <option value="Not Started">Reopen: Not Started</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHistory;
