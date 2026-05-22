import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../api';
import { GraduationCap, Lock, Mail, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { 
        toast.error('Please fill in all fields'); 
        return; 
    }
    if (form.password.length < 4) { 
        toast.error('Password must be at least 4 characters'); 
        return; 
    }
    
    setLoading(true);
    try {
      await authAPI.signup(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

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
            <p className="text-cyan-200 font-bold text-sm flex items-center gap-1.5 tracking-wider mt-0.5 drop-shadow-sm">
                <Sparkles size={12} className="text-cyan-300" /> Secure Registration
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative z-10 text-center"
        >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full border border-white/20 mb-8 backdrop-blur-md shadow-lg">
                <User size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-lg">
                Join the Future of<br />
                <span className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Academic Planning</span>
            </h1>
            <p className="text-indigo-100 font-medium text-base leading-relaxed max-w-sm mx-auto drop-shadow-md">
                Create an account to build conflict-free timetables backed by an advanced genetic algorithm.
            </p>
        </motion.div>

        <div /> {/* Spacer */}
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

          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Create Account</h2>
          <p className="text-slate-600 font-semibold text-base mb-10 tracking-wide">Enter your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-12 text-base"
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                <input
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
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary justify-center py-3.5 text-lg mt-4 shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : 'Sign Up →'}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold tracking-wide text-slate-600">
            Already have an account?{' '}
            <Link to="/" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
