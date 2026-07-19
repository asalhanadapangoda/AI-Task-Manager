import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiLock, FiMail, FiCompass } from 'react-icons/fi';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      toast.success('System Verification Successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none"></div>

      {/* Split Left Column (Visual Branding, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-r border-slate-900 relative items-center justify-center p-12">
        <div className="max-w-md text-left space-y-6 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-8">
            <FiCompass size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Configure Team Pipelines with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Intelligent Guidance</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Verify credentials to access operational summaries, assign multi-node tasks, and interact with the generative-ai analytics engine.
          </p>

        </div>
      </div>

      {/* Split Right Column (Login Panel) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="max-w-sm w-full space-y-8 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-900 shadow-2xl">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Access Hub</h3>
            <p className="text-xs text-slate-400">Please provide security coordinates to establish session.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold font-mono text-slate-500 uppercase mb-1">Email Coordinates</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><FiMail size={16} /></span>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold font-mono text-slate-500 uppercase mb-1">Security Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><FiLock size={16} /></span>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-indigo-950/40 disabled:opacity-50"
            >
              {isSubmitting ? 'Establishing Connection...' : 'Verify Access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
