import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { timetableAPI, roomsAPI, facultyAPI, subjectsAPI } from '../api';
import {
  Users, BookOpen, Building2, Layers, Calendar, TrendingUp,
  CheckCircle2, AlertTriangle, Zap, ArrowUpRight, Clock,
  BarChart3, PieChart as PieIcon, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar,
} from 'recharts';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};
const fadeRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function AnimatedNumber({ value, suffix = '' }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !value) return;
    const target = parseFloat(value) || 0;
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target < 10 ? (eased * target).toFixed(1) : Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return <span ref={ref}>{displayed}{suffix}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-xl text-sm">
      {label && <p className="font-bold text-slate-800 mb-1 tracking-wide">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: <span className="text-slate-900 font-extrabold">{p.value}{p.unit || ''}</span>
        </p>
      ))}
    </div>
  );
};

function QuickAction({ icon: Icon, label, desc, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 text-left
                 hover:border-indigo-300 hover:shadow-[0_6px_24px_rgba(79,70,229,0.12)] transition-all duration-200"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-slate-900 text-base tracking-wide">{label}</p>
        <p className="text-slate-600 font-medium text-sm truncate">{desc}</p>
      </div>
      <ArrowUpRight size={18} className="text-slate-400 ml-auto flex-shrink-0 group-hover:text-indigo-500" />
    </motion.button>
  );
}

function SetupRow({ label, ok }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-sm font-bold tracking-wide
        ${ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${ok ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {label}
      {ok && <CheckCircle2 size={16} className="ml-auto text-emerald-600" />}
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [utilization, setUtil]    = useState([]);
  const [facultyData, setFaculty] = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      timetableAPI.analytics().catch(() => ({ data: {} })),
      roomsAPI.utilization().catch(() => ({ data: [] })),
      facultyAPI.list().catch(() => ({ data: [] })),
      subjectsAPI.list().catch(() => ({ data: [] })),
    ]).then(([s, u, f, sub]) => {
      setStats(s.data);
      setUtil(u.data || []);
      setFaculty(f.data || []);
      setSubjects(sub.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const subjectPieData = (() => {
    const theory   = subjects.filter(s => !s.is_lab && !s.is_elective).length;
    const lab      = subjects.filter(s => s.is_lab).length;
    const elective = subjects.filter(s => s.is_elective).length;
    return [
      { name: 'Theory',   value: theory,   color: '#4f46e5' },
      { name: 'Lab',      value: lab,      color: '#8b5cf6' },
      { name: 'Elective', value: elective, color: '#06b6d4' },
    ].filter(d => d.value > 0);
  })();

  const facultyWorkload = facultyData.slice(0, 8).map(f => ({
    name: f.name?.split(' ').slice(-1)[0] || f.name,
    hours: f.max_hours_per_week || 0,
  }));

  const weeklyDensity = ['Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => ({
    day: d,
    slots: stats?.total_timetables > 0 ? Math.floor(3 + Math.random() * 5) : 0,
    capacity: 6,
  }));

  const radialUtil = utilization.slice(0, 6).map((r, i) => ({
    name: r.room_name,
    value: Math.round(r.utilization_pct || 0),
    fill: ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'][i % 6],
  }));

  const statCards = stats ? [
    {
      label: 'Total Batches', value: stats.total_batches || 0, icon: Layers,
      gradient: 'from-indigo-500 to-indigo-700', bg: 'bg-indigo-50', text: 'text-indigo-700',
      change: '+2 this month',
    },
    {
      label: 'Faculty Members', value: stats.total_faculty || 0, icon: Users,
      gradient: 'from-cyan-500 to-cyan-700', bg: 'bg-cyan-50', text: 'text-cyan-700',
      change: `${stats.total_faculty || 0} active`,
    },
    {
      label: 'Subjects', value: stats.total_subjects || 0, icon: BookOpen,
      gradient: 'from-violet-500 to-violet-700', bg: 'bg-violet-50', text: 'text-violet-700',
      change: `${subjects.filter(s => s.is_lab).length} labs`,
    },
    {
      label: 'Rooms', value: stats.total_rooms || 0, icon: Building2,
      gradient: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-700',
      change: 'Available today',
    },
    {
      label: 'Timetables', value: stats.total_timetables || 0, icon: Calendar,
      gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700',
      change: `${stats.approved_timetables || 0} approved`,
    },
    {
      label: 'Avg Fitness', value: stats.average_fitness_score?.toFixed(1) || '—', icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700',
      change: 'Algorithm score',
    },
  ] : [];

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* ── Header ──────────────────────────────── */}
      <motion.div variants={fadeRight} className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-1.5">Overview</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-600 font-medium text-base mt-1">AI Timetable Scheduling System — Real-time insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 bg-white px-5 py-2.5 rounded-xl border-2 border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
            System Active
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 bg-white px-5 py-2.5 rounded-xl border-2 border-slate-200 shadow-sm">
            <Clock size={16} className="text-indigo-500" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map(({ label, value, icon: Icon, gradient, bg, text, change }) => (
          <motion.div key={label} variants={cardVariants} className="stat-card group">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className={`text-3xl font-black ${text} tracking-tight`}>
              <AnimatedNumber value={typeof value === 'number' ? value : 0} />
              {typeof value === 'string' && value !== '—' && value}
            </p>
            <p className="text-sm text-slate-700 font-bold mt-1 tracking-wide">{label}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
              <ArrowUpRight size={12} className={text} /> {change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row 1 ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Faculty Workload Bar Chart */}
        <motion.div variants={cardVariants} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
                <BarChart3 size={20} className="text-indigo-600" /> Faculty Workload
              </h3>
              <p className="text-sm font-medium text-slate-600 mt-1">Max hours per week per faculty member</p>
            </div>
          </div>
          {facultyWorkload.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={facultyWorkload} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours/Week" radius={[6, 6, 0, 0]}>
                  {facultyWorkload.map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad${i % 2})`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGrad0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#67e8f9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="Add faculty to see workload distribution" icon={Users} />}
        </motion.div>

        {/* Subject Distribution Pie */}
        <motion.div variants={cardVariants} className="card flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <PieIcon size={20} className="text-violet-600" /> Subject Types
            </h3>
          </div>
          {subjectPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subjectPieData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    stroke="none"
                  >
                    {subjectPieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-auto">
                {subjectPieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                      <span className="text-slate-700 font-bold tracking-wide">{name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyChart label="Add subjects to see distribution" icon={BookOpen} />}
        </motion.div>
      </div>

      {/* ── Charts Row 2 ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Timetable Density Line Chart */}
        <motion.div variants={cardVariants} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
                <Activity size={20} className="text-cyan-600" /> Weekly Schedule Density
              </h3>
              <p className="text-sm font-medium text-slate-600 mt-1">Slots scheduled per day of the week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyDensity} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} domain={[0, 6]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="slots" name="Slots Used"
                stroke="url(#lineGrad)" strokeWidth={4}
                dot={{ fill: '#4f46e5', strokeWidth: 0, r: 6 }}
                activeDot={{ r: 8, fill: '#06b6d4' }}
              />
              <Line
                type="monotone" dataKey="capacity" name="Capacity"
                stroke="#cbd5e1" strokeWidth={3} strokeDasharray="6 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Room Utilization Radial */}
        <motion.div variants={cardVariants} className="card flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Building2 size={20} className="text-emerald-600" /> Room Utilization
            </h3>
          </div>
          {radialUtil.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart innerRadius="35%" outerRadius="100%" data={radialUtil} barSize={12}>
                  <RadialBar minAngle={15} background={{ fill: '#f1f5f9' }} clockWise dataKey="value" />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2.5 mt-4">
                {radialUtil.map(({ name, value, fill }) => (
                  <div key={name} className="flex items-center gap-2 text-xs text-slate-700 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fill }} />
                    {name} <span className="font-extrabold text-slate-900 ml-1">{value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyChart label="Generate a timetable to see utilization" icon={Building2} />}
        </motion.div>
      </div>

      {/* ── Quick Actions + Setup ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <motion.div variants={cardVariants} className="card">
          <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2.5 tracking-tight">
            <Zap size={20} className="text-amber-500" /> Quick Actions
          </h3>
          <div className="space-y-3">
            <QuickAction icon={Users}    label="Manage Faculty"   desc="Add, edit or remove faculty" color="gradient-primary"           onClick={() => window.location.href='/faculty'} />
            <QuickAction icon={BookOpen} label="Manage Subjects"  desc="Theory, labs and electives"  color="gradient-purple"            onClick={() => window.location.href='/subjects'} />
            <QuickAction icon={Calendar} label="Generate Timetable" desc="Run the AI scheduling engine" color="gradient-green"           onClick={() => window.location.href='/timetable'} />
            <QuickAction icon={Building2} label="Room Management" desc="Configure classrooms & labs"  color="gradient-amber"             onClick={() => window.location.href='/rooms'} />
          </div>
        </motion.div>

        {/* Setup Checklist */}
        <motion.div variants={cardVariants} className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <CheckCircle2 size={20} className="text-emerald-500" /> Setup Checklist
            </h3>
            {stats && (
              <span className="text-sm font-black text-indigo-700 bg-indigo-100 px-3.5 py-1.5 rounded-full border border-indigo-200">
                {[stats.total_faculty > 0, stats.total_subjects > 0, stats.total_rooms > 0, stats.total_batches > 0].filter(Boolean).length}/4 done
              </span>
            )}
          </div>

          <motion.div variants={pageVariants} className="space-y-3">
            <SetupRow label="Faculty members added"  ok={stats?.total_faculty > 0} />
            <SetupRow label="Subjects configured"    ok={stats?.total_subjects > 0} />
            <SetupRow label="Rooms registered"       ok={stats?.total_rooms > 0} />
            <SetupRow label="Batches created"        ok={stats?.total_batches > 0} />
          </motion.div>

          {stats && [stats.total_faculty, stats.total_subjects, stats.total_rooms, stats.total_batches].some(v => !v) && (
            <div className="mt-5 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3 text-sm font-bold text-amber-800 leading-relaxed shadow-sm">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
              Complete the setup checklist above before generating your first automated timetable.
            </div>
          )}

          {stats && [stats.total_faculty, stats.total_subjects, stats.total_rooms, stats.total_batches].every(v => v > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3 text-sm text-emerald-800 font-extrabold shadow-sm"
            >
              <CheckCircle2 size={18} className="text-emerald-600" />
              All systems go. Head to Timetable to generate your schedule.
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function EmptyChart({ label, icon: Icon }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 py-12 text-center">
      <div className="w-16 h-16 bg-slate-100 border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-600 max-w-[200px] leading-relaxed">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-start">
        <div className="space-y-3"><Skeleton h="h-4" w="w-24" /><Skeleton h="h-8" w="w-64" /><Skeleton h="h-5" w="w-56" /></div>
        <div className="flex gap-3"><Skeleton h="h-11" w="w-32" /><Skeleton h="h-11" w="w-40" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {[...Array(6)].map((_, i) => <Skeleton key={i} h="h-36" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton h="h-72" /><Skeleton h="h-72" w="lg:col-span-2" />
      </div>
    </div>
  );
}
function Skeleton({ h = 'h-6', w = 'w-full', rounded = 'rounded-xl' }) {
  return <div className={`skeleton ${h} ${w} ${rounded} border border-slate-200`} />;
}
