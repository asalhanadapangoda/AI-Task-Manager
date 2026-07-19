import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiCheckSquare, FiUsers, FiLogOut, FiMessageSquare, FiX, FiSend, FiCompass, FiArchive } from 'react-icons/fi';
import api from '../../utils/api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: 'Hello! I am your AI Task Assistant. Ask me anything about your tasks!', sender: 'ai' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userName = userInfo.name || 'User';
  const userRole = userInfo.role || 'Member';

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...chatMessages, { text: inputMessage, sender: 'user' }];
    setChatMessages(newMessages);
    setInputMessage('');

    try {
      const typingMessages = [...newMessages, { text: 'Thinking...', sender: 'ai', isTyping: true }];
      setChatMessages(typingMessages);

      const response = await api.post('/ai/chat', { question: inputMessage });
      setChatMessages([...newMessages, { text: response.data.answer, sender: 'ai' }]);
    } catch (error) {
      setChatMessages([...newMessages, { text: 'Sorry, I am having trouble connecting to the server.', sender: 'ai' }]);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Dynamic Animated Background Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 border-r border-slate-900 flex flex-col hidden md:flex z-20 relative">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <FiCompass size={22} className="text-white animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400 block leading-none mb-1">
              SMART TASK
            </span>
            <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase block leading-none">Global Control</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive('/dashboard') 
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FiHome size={18} /> Overview
          </Link>
          <Link 
            to="/dashboard/tasks" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive('/dashboard/tasks') 
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FiCheckSquare size={18} /> {userRole.toLowerCase() === 'admin' ? 'Assign Task' : 'My Tasks'}
          </Link>
          <Link 
            to="/dashboard/history" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive('/dashboard/history') 
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FiArchive size={18} /> Task History
          </Link>
          {userRole.toLowerCase() === 'admin' && (
            <Link 
              to="/dashboard/team" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive('/dashboard/team') 
                  ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FiUsers size={18} /> Team Control
            </Link>
          )}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-900/30">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-200">{userName}</p>
              <p className="text-[10px] text-slate-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all duration-300 text-sm"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-8">
          <div className="flex flex-col">
            <div className="text-base font-bold text-white tracking-wide leading-tight">
              {isActive('/dashboard') ? 'Global Operations Center' : isActive('/dashboard/tasks') ? (userRole.toLowerCase() === 'admin' ? 'Assign Task' : 'Task Ledger') : isActive('/dashboard/history') ? 'History Ledger' : 'Team Registry'}
            </div>
            <p className="text-xs text-slate-500">Live network updates and performance summaries.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-400 font-mono">System Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-slate-900/90 backdrop-blur-xl w-80 h-96 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-4 border border-indigo-500/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-4 border-b border-slate-800 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-pulse">🤖</span>
                <div>
                  <span className="font-semibold text-white text-sm block">Core AI Assistant</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition">
                <FiX size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-950/40">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white self-end shadow-lg shadow-indigo-600/10' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 self-start shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Query system status..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none transition"
              />
              <button 
                type="submit"
                className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition flex-shrink-0 shadow-md"
              >
                <FiSend size={14} />
              </button>
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 ${
            isChatOpen ? 'bg-slate-900 border border-slate-800' : 'bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          }`}
        >
          {isChatOpen ? <FiX size={20} /> : <FiMessageSquare size={20} />}
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
