import { useEffect, useState } from 'react';
import { facultyAPI } from '../api';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Edit3, X, Check, Mail, Clock } from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'Other'];
const DEPT_COLORS = {
  CSE: 'badge-blue', ECE: 'badge-teal', EEE: 'badge-amber',
  MECH: 'badge-purple', CIVIL: 'badge-green', MBA: 'badge-gray',
  MCA: 'badge-blue', Other: 'badge-gray',
};

const defaultForm = {
  name: '', email: '', department: 'CSE', max_hours_per_week: 18,
  availability: {
    MON: [1,2,3,4,5,6], TUE: [1,2,3,4,5,6], WED: [1,2,3,4,5,6],
    THU: [1,2,3,4,5,6], FRI: [1,2,3,4,5,6], SAT: [],
  },
};

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setFaculty((await facultyAPI.list()).data); } catch { toast.error('Failed to load faculty'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setLoading(true);
    try {
      if (editing) { await facultyAPI.update(editing, form); toast.success('Faculty updated'); }
      else { await facultyAPI.create(form); toast.success('Faculty added'); }
      setForm(defaultForm); setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error saving'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try { await facultyAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const startEdit = (f) => {
    setForm({ name: f.name, email: f.email, department: f.department, max_hours_per_week: f.max_hours_per_week, availability: f.availability });
    setEditing(f._id); setShowForm(true);
  };

  const toggleSlot = (day, slot) => {
    setForm(prev => {
      const avail = { ...prev.availability };
      const slots = avail[day] || [];
      avail[day] = slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot].sort((a, b) => a - b);
      return { ...prev, availability: avail };
    });
  };

  const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const avatarColors = [
    'bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700',
    'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700',
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-blue-500" /> Faculty
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-0.5">Manage teaching staff and their availability</p>
        </div>
        <button id="add-faculty-btn" onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary">
          <Plus size={15} /> Add Faculty
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Faculty Member</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input id="faculty-name" className="input-field" placeholder="Dr. Ramesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input id="faculty-email" className="input-field" type="email" placeholder="faculty@college.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select id="faculty-dept" className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Max Hours / Week</label>
                  <input id="faculty-hours" className="input-field" type="number" min="1" max="40" value={form.max_hours_per_week} onChange={e => setForm({...form, max_hours_per_week: +e.target.value})} />
                </div>
              </div>

              {/* Availability grid */}
              <div>
                <label className="label mb-2">Availability <span className="text-slate-600 font-semibold font-normal text-xs">(click slots to toggle)</span></label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2.5 text-left text-slate-700 font-semibold font-semibold">Day</th>
                        {[1,2,3,4,5,6].map(s => (
                          <th key={s} className="px-2 py-2.5 text-center text-slate-700 font-semibold font-semibold">P{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {DAYS.map(day => (
                        <tr key={day} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-600 font-semibold">{day}</td>
                          {[1,2,3,4,5,6].map(slot => {
                            const active = (form.availability[day] || []).includes(slot);
                            return (
                              <td key={slot} className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleSlot(day, slot)}
                                  className={`w-8 h-8 rounded-lg text-sm font-semibold tracking-wide font-semibold transition-all
                                    ${active
                                      ? 'bg-blue-500 text-white shadow-sm'
                                      : 'bg-gray-100 text-slate-600 font-semibold hover:bg-gray-200'}`}
                                >
                                  {slot}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button id="save-faculty-btn" onClick={submit} disabled={loading} className="btn-primary">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  {editing ? 'Update Faculty' : 'Add Faculty'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {faculty.length === 0 ? (
          <div className="col-span-3 card text-center py-16">
            <Users size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-slate-600 font-semibold font-semibold">No faculty members added yet</p>
            <p className="text-slate-500 font-semibold text-sm mt-1">Click "Add Faculty" to get started</p>
          </div>
        ) : faculty.map((f, idx) => (
          <div key={f._id} className="card-sm hover:shadow-card-hover transition-shadow duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                  {initials(f.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{f.name}</p>
                  <p className="text-sm font-semibold tracking-wide text-slate-600 font-semibold flex items-center gap-1 mt-0.5 truncate">
                    <Mail size={10} /> {f.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => startEdit(f)} className="btn-icon"><Edit3 size={14} /></button>
                <button onClick={() => del(f._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className={DEPT_COLORS[f.department] || 'badge-gray'}>{f.department}</span>
              <span className="badge-gray">
                <Clock size={10} /> {f.max_hours_per_week}h/week
              </span>
            </div>

            {/* Mini availability bar */}
            <div className="flex gap-1 mt-3">
              {DAYS.map(day => {
                const slots = (f.availability?.[day] || []).length;
                return (
                  <div key={day} className="flex-1 text-center">
                    <div className={`h-1.5 rounded-full ${slots >= 4 ? 'bg-blue-400' : slots > 0 ? 'bg-blue-200' : 'bg-gray-100'}`} />
                    <span className="text-[9px] text-slate-600 font-semibold font-semibold">{day.slice(0,1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
