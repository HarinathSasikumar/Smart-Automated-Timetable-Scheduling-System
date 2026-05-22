import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import { GraduationCap, Lock, Mail, Eye, EyeOff, Sparkles, CheckCircle2, BarChart3, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: Zap,          label: 'Genetic Algorithm',   desc: '200+ generation optimizer' },
  { icon: CheckCircle2, label: 'Conflict Detection',  desc: 'Zero scheduling clashes' },
  { icon: BarChart3,    label: 'Analytics Dashboard', desc: 'Real-time insights' },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    
    setLoading(true);
    try {
      const response = await authAPI.login(form);
      const { access_token, user } = response.data;
      
      localStorage.setItem('tt_token', access_token);
      localStorage.setItem('tt_auth_user', JSON.stringify(user));
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left panel ─────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #4f46e5 0%, #1e40af 55%, #0891b2 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-12 h-12 bg-white/20 border-2 border-white/30 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
            <GraduationCap size={24} className="text-white drop-shadow-md" />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-wide drop-shadow-md">SmartSchedule AI</p>
            <p className="text-cyan-200 font-bold text-sm flex items-center gap-1.5 tracking-wider mt-0.5 drop-shadow-sm"><Sparkles size={12} className="text-cyan-300" /> AI-Powered Timetabling</p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative z-10"
        >
          <h1 className="text-6xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-lg">
            Intelligent<br />
            <span className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Timetable</span><br />
            Scheduling
          </h1>
          <p className="text-indigo-100 font-medium text-lg leading-relaxed max-w-md drop-shadow-md">
            AI-powered scheduling for higher education. Eliminate conflicts,
            balance workloads, and generate optimized timetables in seconds.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl px-5 py-4 shadow-lg hover:bg-white/20 transition-all cursor-default"
              >
                <div className="w-10 h-10 bg-white shadow-inner rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-white text-base font-bold tracking-wide drop-shadow-sm">{label}</p>
                  <p className="text-indigo-100 font-medium text-sm mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-5 relative z-10 mt-12"
        >
          {[['200+', 'Generations'], ['50', 'Population'], ['99%', 'Accuracy']].map(([n, l]) => (
            <div key={l} className="bg-white/10 border-2 border-white/20 rounded-2xl p-5 text-center shadow-lg backdrop-blur-md">
              <p className="text-3xl font-black text-white drop-shadow-md tracking-tight">{n}</p>
              <p className="text-cyan-200 font-bold text-sm mt-1.5 tracking-wide uppercase">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-slate-900 font-black text-2xl tracking-tight">SmartSchedule AI</span>
          </div>

          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Sign in</h2>
          <p className="text-slate-600 font-medium text-base mb-10">Access your timetable management dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="email-input"
                  type="email"
                  placeholder="admin@college.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-12 text-base"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-12 pr-12 text-base tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-btn"
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary justify-center py-3.5 text-lg mt-4 shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 p-5 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
            <p className="text-sm font-bold text-indigo-900 mb-1 tracking-wide">Secure Login</p>
            <p className="text-sm font-medium text-indigo-700 leading-relaxed">Please log in with the credentials you created during sign up.</p>
          </div>
          
          <p className="mt-8 text-center text-sm font-semibold tracking-wide text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
