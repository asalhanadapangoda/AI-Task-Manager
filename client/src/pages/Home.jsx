import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCompass, FiActivity, FiGlobe, FiCpu, FiUsers, FiFileText, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';

const Home = () => {
  const [schedule, setSchedule] = useState([]);
  const [metrics, setMetrics] = useState({ activeTasks: 0, resolutionRate: '100%', synthesis: 'All system nodes running within normal load parameters.' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/tasks/public-schedule');
        setSchedule(response.data.schedule || []);
        if (response.data.metrics) {
          setMetrics(response.data.metrics);
        }
      } catch (error) {
        console.error('Failed to load active system node schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <FiCompass className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400 m-0">
                SMART TASK
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <a href="#monitor" className="hover:text-white transition font-mono text-xs uppercase tracking-wider">Live Grid</a>
              <span className="text-slate-800">|</span>
            </nav>
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-950/40 hover:scale-[1.02] active:scale-95 duration-200"
            >
              Access Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-indigo-400 font-mono">
            <FiGlobe size={12} className="animate-spin-slow" />
            <span>GLOBAL DEPLOYMENT READY</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            Orchestrate Tasks.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Automate with AI.
            </span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
            A premium task management platform built for modern operations. Instantly log workflows, allocate across nodes, and generate intelligence briefs via the core intelligence engine.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/login" 
              className="px-6 py-3.5 bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 hover:scale-[1.02] duration-200"
            >
              Enter Dashboard <FiArrowRight size={14} />
            </Link>
            <a 
              href="#monitor" 
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs uppercase tracking-wider rounded-xl border border-slate-800 hover:border-slate-700 transition"
            >
              View Activity Board
            </a>
          </div>
        </div>

        {/* Hero Right Widget (Mock Dashboard GUI) */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-900 p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition duration-500">
          <div className="flex justify-between items-center pb-4 border-b border-slate-950/60 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">operational_metrics.log</span>
          </div>

          <div className="space-y-6">
            {/* Metric widgets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase">System Tasks</span>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {loading ? '...' : `${metrics.activeTasks} Active`}
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Node Resolution</span>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {loading ? '...' : metrics.resolutionRate}
                </p>
              </div>
            </div>

            {/* AI Prompt Widget preview */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <FiCpu size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase">AI Ops Synthesis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                "{loading ? 'Synthesizing operational parameters...' : metrics.synthesis}"
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Interactive Global Monitor Calendar Section */}
      <section id="monitor" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 relative z-10">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE GRID SIMULATION</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Node Schedule</h2>
          <p 
            className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed text-center"
            style={{ textAlign: 'center', margin: '0 auto', maxWidth: '36rem', display: 'block' }}
          >
            Monitor week-to-week workloads and calendar details compiled live from active system nodes.
          </p>
        </div>

        {/* Styled Calendar Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-900 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/50 text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">
                  <th scope="col" className="px-8 py-5">Node Name</th>
                  <th scope="col" className="px-6 py-5">Monday</th>
                  <th scope="col" className="px-6 py-5">Tuesday</th>
                  <th scope="col" className="px-6 py-5">Wednesday</th>
                  <th scope="col" className="px-6 py-5">Thursday</th>
                  <th scope="col" className="px-6 py-5">Friday</th>
                  <th scope="col" className="px-6 py-5 text-slate-600">Saturday</th>
                  <th scope="col" className="px-6 py-5 text-slate-600">Sunday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-950/40 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-500 font-mono">
                      Querying operational grid databases...
                    </td>
                  </tr>
                ) : schedule.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-500 font-mono">
                      No active system nodes detected.
                    </td>
                  </tr>
                ) : (
                  schedule.map((node) => {
                    const initial = node.name ? node.name.charAt(0).toUpperCase() : '?';
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return (
                      <tr key={node._id} className="hover:bg-slate-900/10 transition">
                        <td className="px-8 py-5 font-bold text-slate-200 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
                            {initial}
                          </div>
                          {node.name}
                        </td>
                        {days.map((day) => {
                          const task = node[day];
                          if (!task) {
                            return (
                              <td key={day} className="px-6 py-5 text-slate-600 font-mono">
                                -
                              </td>
                            );
                          }
                          // Dynamically set category colors based on priority
                          let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                          if (task.priority === 'High') {
                            badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                          } else if (task.priority === 'Medium') {
                            badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                          } else if (task.priority === 'Low') {
                            badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                          }
                          return (
                            <td key={day} className="px-6 py-5">
                              <span className={`px-2.5 py-1 border rounded-full font-mono uppercase text-[9px] font-semibold ${badgeColor}`}>
                                {task.title}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <FiCompass size={16} />
          <span>© {new Date().getFullYear()} Smart Task Management. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 font-mono">
          <span>SECURE SHELL: ACTIVE</span>
          <span>NODE: v2.4</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
