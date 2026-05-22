import { useEffect, useState } from 'react';
import { subjectsAPI } from '../api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Trash2, Edit3, X, Check, FlaskConical, GraduationCap, Sparkles } from 'lucide-react';

const defaultForm = {
  name: '', code: '', department: 'CSE', type: 'theory',
  weekly_hours: 4, is_lab: false, is_elective: false, credits: 4,
};

const TYPE_BADGE = {
  theory:   'badge-blue',
  lab:      'badge-purple',
  elective: 'badge-amber',
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setSubjects((await subjectsAPI.list()).data); } catch { toast.error('Failed to load subjects'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.code) { toast.error('Name and code required'); return; }
    setLoading(true);
    try {
      if (editing) { await subjectsAPI.update(editing, form); toast.success('Subject updated'); }
      else { await subjectsAPI.create(form); toast.success('Subject added'); }
      setForm(defaultForm); setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try { await subjectsAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const startEdit = (s) => {
    setForm({ name: s.name, code: s.code, department: s.department, type: s.type, weekly_hours: s.weekly_hours, is_lab: s.is_lab, is_elective: s.is_elective, credits: s.credits });
    setEditing(s._id); setShowForm(true);
  };

  const SubjectIcon = ({ s }) => s.is_lab
    ? <FlaskConical size={14} className="text-purple-500" />
    : s.is_elective
      ? <Sparkles size={14} className="text-amber-500" />
      : <GraduationCap size={14} className="text-blue-500" />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-500" /> Subjects
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-0.5">Configure courses, labs, and electives</p>
        </div>
        <button id="add-subject-btn" onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary">
          <Plus size={15} /> Add Subject
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Subject</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Subject Name *</label>
                <input id="subject-name" className="input-field" placeholder="Data Structures & Algorithms" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject Code *</label>
                  <input id="subject-code" className="input-field font-mono" placeholder="CS301" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select id="subject-dept" className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {['CSE','ECE','EEE','MECH','CIVIL','MBA','MCA'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select id="subject-type" className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value, is_lab: e.target.value === 'lab', is_elective: e.target.value === 'elective'})}>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
                <div>
                  <label className="label">Weekly Hours</label>
                  <input id="subject-hours" className="input-field" type="number" min="1" max="10" value={form.weekly_hours} onChange={e => setForm({...form, weekly_hours: +e.target.value})} />
                </div>
                <div>
                  <label className="label">Credits</label>
                  <input id="subject-credits" className="input-field" type="number" min="1" max="6" value={form.credits} onChange={e => setForm({...form, credits: +e.target.value})} />
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" id="subject-lab" checked={form.is_lab} onChange={e => setForm({...form, is_lab: e.target.checked})} className="w-4 h-4 rounded accent-purple-500" />
                    Requires Lab Room
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" id="subject-elective" checked={form.is_elective} onChange={e => setForm({...form, is_elective: e.target.checked})} className="w-4 h-4 rounded accent-amber-500" />
                    Is Elective
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button id="save-subject-btn" onClick={submit} disabled={loading} className="btn-primary">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  {editing ? 'Update Subject' : 'Add Subject'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Subject', 'Code', 'Department', 'Type', 'Hours/Week', 'Credits', 'Actions'].map(h => (
                  <th key={h} className="table-header first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-600 font-semibold">
                    <BookOpen size={36} className="mx-auto text-gray-200 mb-2" />
                    No subjects added yet
                  </td>
                </tr>
              ) : subjects.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="table-cell pl-6">
                    <div className="flex items-center gap-2.5">
                      <SubjectIcon s={s} />
                      <span className="font-semibold text-slate-900">{s.name}</span>
                      {s.is_elective && <span className="badge-amber">Elective</span>}
                    </div>
                  </td>
                  <td className="table-cell font-mono text-slate-700 font-semibold">{s.code}</td>
                  <td className="table-cell text-gray-600">{s.department}</td>
                  <td className="table-cell"><span className={TYPE_BADGE[s.type] || 'badge-blue'}>{s.type}</span></td>
                  <td className="table-cell text-gray-600">{s.weekly_hours}h</td>
                  <td className="table-cell text-gray-600">{s.credits}</td>
                  <td className="table-cell pr-6">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(s)} className="btn-icon"><Edit3 size={14} /></button>
                      <button onClick={() => del(s._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
