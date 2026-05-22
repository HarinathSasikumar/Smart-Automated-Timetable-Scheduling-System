import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Building2, Layers,
  Calendar, LogOut, GraduationCap, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/faculty',   label: 'Faculty',   icon: Users },
  { to: '/subjects',  label: 'Subjects',  icon: BookOpen },
  { to: '/rooms',     label: 'Rooms',     icon: Building2 },
  { to: '/batches',   label: 'Batches',   icon: Layers },
  { to: '/timetable', label: 'Timetable', icon: Calendar },
];

const sidebarVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.06 } },
};
const linkVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('tt_auth_user') || '{}');

  const logout = () => {
    localStorage.removeItem('tt_token');
    localStorage.removeItem('tt_auth_user');
    toast.success('Logged out securely');
    navigate('/');
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 min-h-screen flex flex-col shrink-0 py-6 px-4"
      style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #1e40af 55%, #0891b2 100%)',
        boxShadow: '4px 0 32px rgba(79,70,229,0.22)',
      }}
    >
      {/* Logo */}
      <motion.div variants={linkVariants} className="flex items-center gap-3 px-3 mb-10 mt-2">
        <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-md shadow-lg">
          <GraduationCap size={24} className="text-white drop-shadow-md" />
        </div>
        <div>
          <p className="font-extrabold text-white text-base leading-tight tracking-wide drop-shadow-md">SmartSchedule</p>
          <p className="text-indigo-100 font-semibold text-xs flex items-center gap-1.5 tracking-wider mt-1 drop-shadow-sm">
            <Sparkles size={11} className="text-cyan-300" /> AI Powered
          </p>
        </div>
      </motion.div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <motion.div key={to} variants={linkVariants}>
            <NavLink
              to={to}
              id={`nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 group relative tracking-wide
                 ${isActive
                  ? 'text-white'
                  : 'text-indigo-100 hover:text-white hover:bg-white/15 drop-shadow-sm'}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active glassmorphism background */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.20)',
                        backdropFilter: 'blur(12px)',
                        border: '2px solid rgba(255,255,255,0.35)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3 w-full">
                    <Icon size={18} className={isActive ? 'text-cyan-200 drop-shadow-md' : 'text-indigo-200 group-hover:text-cyan-200'} />
                    <span className={isActive ? 'drop-shadow-md' : ''}>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    )}
                  </span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-5 border-t border-white/20 shadow-sm" />

      {/* User section */}
      <motion.div variants={linkVariants} className="space-y-3">
        <div className="px-4 py-3 rounded-xl bg-white/15 border-2 border-white/20 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-700 text-sm font-black shadow-inner flex-shrink-0">
              {auth.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold tracking-wide truncate drop-shadow-md">{auth.email || 'admin@college.edu'}</p>
              <p className="text-cyan-200 font-semibold text-xs mt-0.5 tracking-wider drop-shadow-sm">Administrator</p>
            </div>
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-bold tracking-wide
                     text-indigo-100 hover:text-white hover:bg-white/15 hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-white/20"
        >
          <LogOut size={18} className="text-indigo-200 group-hover:text-red-300" />
          Sign Out
        </button>
      </motion.div>
    </motion.aside>
  );
}
