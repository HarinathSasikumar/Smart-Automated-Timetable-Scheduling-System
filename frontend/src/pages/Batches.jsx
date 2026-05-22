import { useEffect, useState } from 'react';
import { batchesAPI, subjectsAPI, facultyAPI } from '../api';
import toast from 'react-hot-toast';
import { Layers, Plus, Trash2, Edit3, X, Check, BookOpen, Users, GraduationCap } from 'lucide-react';

const defaultForm = {
  name: '', department: 'CSE', semester: 1, section: 'A',
  strength: 60, subjects: [], academic_year: '2024-25',
};

const SEM_COLORS = ['','bg-blue-100 text-blue-700','bg-teal-100 text-teal-700','bg-violet-100 text-violet-700','bg-amber-100 text-amber-700','bg-rose-100 text-rose-700','bg-emerald-100 text-emerald-700','bg-sky-100 text-sky-700','bg-pink-100 text-pink-700'];

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [b, s, f] = await Promise.all([batchesAPI.list(), subjectsAPI.list(), facultyAPI.list()]);
      setBatches(b.data); setSubjects(s.data); setFaculty(f.data);
    } catch { toast.error('Failed to load data'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name) { toast.error('Batch name is required'); return; }
    setLoading(true);
    try {
      if (editing) { await batchesAPI.update(editing, form); toast.success('Batch updated'); }
      else { await batchesAPI.create(form); toast.success('Batch added'); }
      setForm(defaultForm); setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try { await batchesAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const startEdit = (b) => {
    setForm({ name: b.name, department: b.department, semester: b.semester, section: b.section, strength: b.strength, subjects: b.subjects || [], academic_year: b.academic_year });
    setEditing(b._id); setShowForm(true);
  };

  const addRow = () => setForm(prev => ({ ...prev, subjects: [...prev.subjects, { subject_id: '', faculty_id: '' }] }));
  const removeRow = (i) => setForm(prev => ({ ...prev, subjects: prev.subjects.filter((_, idx) => idx !== i) }));
  const updateRow = (i, field, val) => setForm(prev => {
    const s = [...prev.subjects]; s[i] = { ...s[i], [field]: val }; return { ...prev, subjects: s };
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Layers size={24} className="text-blue-500" /> Batches
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-0.5">Class groups with subject–faculty assignments</p>
        </div>
        <button id="add-batch-btn" onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary">
          <Plus size={15} /> Add Batch
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ paddingTop: '5vh' }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Batch</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Batch Name *</label>
                  <input id="batch-name" className="input-field" placeholder="CSE-3A" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select id="batch-dept" className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {['CSE','ECE','EEE','MECH','CIVIL','MBA','MCA'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Semester</label>
                  <select id="batch-sem" className="input-field" value={form.semester} onChange={e => setForm({...form, semester: +e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Section</label>
                  <input id="batch-section" className="input-field" placeholder="A" maxLength={2} value={form.section} onChange={e => setForm({...form, section: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="label">Student Strength</label>
                  <input id="batch-strength" className="input-field" type="number" min="1" value={form.strength} onChange={e => setForm({...form, strength: +e.target.value})} />
                </div>
                <div>
                  <label className="label">Academic Year</label>
                  <input id="batch-year" className="input-field" placeholder="2024-25" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
                </div>
              </div>

              {/* Subject Assignments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Subject–Faculty Assignments</label>
                  <button type="button" onClick={addRow} className="btn-secondary text-sm font-semibold tracking-wide py-1.5 px-3">
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {form.subjects.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-600 font-semibold bg-gray-50">
                      No subjects assigned. Click "Add Row" above.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold tracking-wide font-semibold text-slate-700 font-semibold">
                          <th className="px-4 py-2.5 text-left">Subject</th>
                          <th className="px-4 py-2.5 text-left">Faculty</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {form.subjects.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <select className="input-field text-sm font-semibold tracking-wide py-1.5" value={s.subject_id} onChange={e => updateRow(i, 'subject_id', e.target.value)}>
                                <option value="">— Select Subject —</option>
                                {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select className="input-field text-sm font-semibold tracking-wide py-1.5" value={s.faculty_id} onChange={e => updateRow(i, 'faculty_id', e.target.value)}>
                                <option value="">— Select Faculty —</option>
                                {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                              </select>
                            </td>
                            <td className="pr-3">
                              <button onClick={() => removeRow(i)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button id="save-batch-btn" onClick={submit} disabled={loading} className="btn-primary">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  {editing ? 'Update Batch' : 'Add Batch'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {batches.length === 0 ? (
          <div className="col-span-3 card text-center py-16">
            <Layers size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-slate-600 font-semibold font-semibold">No batches added yet</p>
            <p className="text-slate-500 font-semibold text-sm mt-1">Click "Add Batch" to get started</p>
          </div>
        ) : batches.map(b => (
          <div key={b._id} className="card-sm hover:shadow-card-hover transition-shadow group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${SEM_COLORS[b.semester] || 'bg-blue-100 text-blue-700'}`}>
                  S{b.semester}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{b.name}</p>
                  <p className="text-sm font-semibold tracking-wide text-slate-600 font-semibold">{b.department} · Sem {b.semester} · Sec {b.section}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(b)} className="btn-icon"><Edit3 size={14} /></button>
                <button onClick={() => del(b._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge-gray">{b.academic_year}</span>
              <span className="badge-blue"><Users size={10} /> {b.strength} students</span>
              <span className="badge-green"><BookOpen size={10} /> {b.subjects?.length || 0} subjects</span>
            </div>

            {/* Subject mini list */}
            {b.subjects?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {b.subjects.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 font-semibold">
                    <GraduationCap size={10} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{subjects.find(sub => sub._id === s.subject_id)?.name || s.subject_id}</span>
                  </div>
                ))}
                {b.subjects.length > 3 && (
                  <p className="text-sm font-semibold tracking-wide text-slate-600 font-semibold">+{b.subjects.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
