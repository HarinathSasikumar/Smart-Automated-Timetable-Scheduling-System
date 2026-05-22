import { useEffect, useState } from 'react';
import { roomsAPI } from '../api';
import toast from 'react-hot-toast';
import { Building2, Plus, Trash2, Edit3, X, Check, Users, Monitor, Wind, FlaskConical } from 'lucide-react';

const defaultForm = {
  name: '', building: '', floor: 0, type: 'classroom',
  capacity: 60, has_projector: false, has_ac: false,
};

const TYPE_CONFIG = {
  classroom:  { badge: 'badge-blue',   icon: Building2,     label: 'Classroom' },
  lab:        { badge: 'badge-purple', icon: FlaskConical,  label: 'Lab' },
  seminar:    { badge: 'badge-teal',   icon: Users,         label: 'Seminar' },
  auditorium: { badge: 'badge-amber',  icon: Monitor,       label: 'Auditorium' },
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setRooms((await roomsAPI.list()).data); } catch { toast.error('Failed to load rooms'); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name) { toast.error('Room name is required'); return; }
    setLoading(true);
    try {
      if (editing) { await roomsAPI.update(editing, form); toast.success('Room updated'); }
      else { await roomsAPI.create(form); toast.success('Room added'); }
      setForm(defaultForm); setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this room?')) return;
    try { await roomsAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const startEdit = (r) => {
    setForm({ name: r.name, building: r.building || '', floor: r.floor ?? 0, type: r.type, capacity: r.capacity, has_projector: r.has_projector, has_ac: r.has_ac });
    setEditing(r._id); setShowForm(true);
  };

  // Group by type for display
  const grouped = rooms.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 size={24} className="text-blue-500" /> Rooms
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-0.5">Manage classrooms, labs, and facilities</p>
        </div>
        <button id="add-room-btn" onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary">
          <Plus size={15} /> Add Room
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Room</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Room Name *</label>
                  <input id="room-name" className="input-field" placeholder="Room 101 / CS Lab A" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Building / Block</label>
                  <input id="room-building" className="input-field" placeholder="Block A" value={form.building} onChange={e => setForm({...form, building: e.target.value})} />
                </div>
                <div>
                  <label className="label">Room Type</label>
                  <select id="room-type" className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity (seats)</label>
                  <input id="room-capacity" className="input-field" type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: +e.target.value})} />
                </div>
                <div>
                  <label className="label">Floor</label>
                  <input id="room-floor" className="input-field" type="number" min="0" value={form.floor} onChange={e => setForm({...form, floor: +e.target.value})} />
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" id="room-projector" checked={form.has_projector} onChange={e => setForm({...form, has_projector: e.target.checked})} className="w-4 h-4 rounded accent-blue-500" />
                    <Monitor size={13} className="text-slate-600 font-semibold" /> Has Projector
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" id="room-ac" checked={form.has_ac} onChange={e => setForm({...form, has_ac: e.target.checked})} className="w-4 h-4 rounded accent-teal-500" />
                    <Wind size={13} className="text-slate-600 font-semibold" /> Has AC
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button id="save-room-btn" onClick={submit} disabled={loading} className="btn-primary">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  {editing ? 'Update Room' : 'Add Room'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room List */}
      {rooms.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-slate-600 font-semibold font-semibold">No rooms added yet</p>
          <p className="text-slate-500 font-semibold text-sm mt-1">Click "Add Room" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((r) => {
            const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.classroom;
            const TypeIcon = cfg.icon;
            const utilizationColor = r.capacity >= 60 ? 'text-blue-600' : r.capacity >= 40 ? 'text-teal-600' : 'text-slate-700 font-semibold';
            return (
              <div key={r._id} className="card-sm hover:shadow-card-hover transition-shadow duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TypeIcon size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                      <p className="text-sm font-semibold tracking-wide text-slate-600 font-semibold">{r.building}{r.floor != null ? ` · Floor ${r.floor}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(r)} className="btn-icon"><Edit3 size={14} /></button>
                    <button onClick={() => del(r._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={cfg.badge}>{cfg.label}</span>
                  <span className={`badge badge-gray ${utilizationColor}`}>
                    <Users size={10} /> {r.capacity} seats
                  </span>
                  {r.has_projector && <span className="badge badge-blue"><Monitor size={9} /> Projector</span>}
                  {r.has_ac && <span className="badge badge-teal"><Wind size={9} /> AC</span>}
                </div>

                {/* Capacity bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm font-semibold tracking-wide text-slate-600 font-semibold mb-1">
                    <span>Capacity</span>
                    <span className="font-semibold text-gray-600">{r.capacity} seats</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(100, (r.capacity / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
