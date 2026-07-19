import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDownload, FiCpu, FiTrendingUp, FiActivity, FiLayers, FiClock } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const DashboardOverview = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [motivationQuote, setMotivationQuote] = useState({ text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' });
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, summaryRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/ai/summary')
        ]);
        setTasks(tasksRes.data);
        setAiSummary(summaryRes.data.summary);
        if (summaryRes.data.motivationQuote) {
          setMotivationQuote(summaryRes.data.motivationQuote);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDownloadReport = async (type) => {
    setIsGenerating(true);
    try {
      const response = await api.get(`/reports/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Task_Report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`${type.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to generate ${type.toUpperCase()} report`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;

  const data = [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 6 },
    { name: 'Thu', tasks: 2 },
    { name: 'Fri', tasks: 7 },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-mono text-indigo-400">CONNECTING TO GLOBAL CONTROL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiActivity className="text-indigo-500" /> Command Analytics
          </div>
          <p className="text-sm text-slate-400 mt-1">Aggregated tracking of all current operations and metrics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleDownloadReport('pdf')}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg shadow-rose-950/20 disabled:opacity-50"
          >
            <FiDownload /> {isGenerating ? 'Compiling PDF...' : 'PDF Briefing'}
          </button>
          <button 
            onClick={() => handleDownloadReport('excel')}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition duration-300 shadow-lg shadow-emerald-950/20 disabled:opacity-50"
          >
            <FiDownload /> {isGenerating ? 'Compiling XLS...' : 'Excel Sheet'}
          </button>
        </div>
      </div>

      {/* AI Summary Card (Admins Only) */}
      {isAdmin && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FiCpu size={120} className="text-indigo-400" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase font-mono">
                AI Operations Synthesis
              </h2>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed max-w-4xl prose prose-invert prose-indigo">
              {aiSummary ? (
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              ) : (
                <p className="text-slate-400">Operational patterns pending. Add tasks to configure intelligent system overview.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl transition hover:border-slate-800">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">Total Registry</p>
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400"><FiLayers size={14} /></span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4 tracking-tight">{totalTasks}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl transition hover:border-emerald-500/20">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase font-mono">Resolved</p>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400"><FiActivity size={14} /></span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4 tracking-tight">{completedTasks}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl transition hover:border-amber-500/20">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-amber-500 tracking-wider uppercase font-mono">Pending Dispatch</p>
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400"><FiClock size={14} /></span>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-4 tracking-tight">{pendingTasks}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-xl transition hover:border-rose-500/20">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-rose-500 tracking-wider uppercase font-mono">Overdue Threshold</p>
            <span className="p-1 rounded-lg bg-rose-500/10 text-rose-400"><FiTrendingUp size={14} /></span>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-4 tracking-tight">{overdueTasks}</p>
        </div>
      </div>

      {/* Conditional Bottom Grid */}
      {isAdmin ? (
        /* Admin View: Charts & Active Node List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completion Graph */}
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-2xl">
            <h2 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase mb-6">Activity Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} 
                    labelStyle={{ color: '#94a3b8' }} 
                  />
                  <Bar dataKey="tasks" fill="url(#colorTasks)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Member list / Productivity panel */}
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-900 shadow-2xl">
            <h2 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase mb-6">Active Node Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">A</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">System Admin</p>
                    <p className="text-[10px] font-mono text-slate-500">Node controller</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Member View: AI Motivation & Outlook Board */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Motivation & Outlook Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FiCpu size={120} className="text-indigo-400" />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">
                  AI FOCUS BOARD
                </h2>
              </div>
              
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900/80 font-mono text-xs text-slate-400 space-y-3 shadow-inner">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Assignee Node:</span>
                  <span className="text-slate-200 font-semibold">{userInfo.name || 'Member'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Operational status:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">ACTIVE</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Pending Load:</span>
                  <span className="text-white font-bold">{pendingTasks} Task{pendingTasks !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution Rate:</span>
                  <span className="text-indigo-400 font-bold">{totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-900 relative z-10">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Motivation Boost</span>
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                <p className="text-xs text-slate-300 italic leading-relaxed font-sans">
                  "{motivationQuote.text}"
                </p>
                <span className="text-[10px] font-mono text-indigo-400 block mt-2 text-right">— {motivationQuote.author}</span>
              </div>
            </div>
          </div>

          {/* AI Completion Steps Panel */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-900 p-8 rounded-3xl shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-950/60">
              <div className="flex items-center gap-2">
                <FiActivity className="text-emerald-400" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
                  Today's Execution Guidance (AI)
                </h2>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                Live Analysis
              </span>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed max-w-4xl prose prose-invert prose-indigo font-sans markdown-body-custom">
              {aiSummary ? (
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-slate-500 font-mono text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-2"></div>
                  Assembling personalized task guide...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
