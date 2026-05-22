import { useEffect, useState, useCallback } from 'react';
import { batchesAPI, timetableAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Calendar, Zap, AlertTriangle, CheckCircle2, Download,
  Trash2, Eye, Clock, ChevronDown, ChevronUp, Info, FlaskConical
} from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };
const SLOT_TIMES = {
  1: '08:30 – 09:20', 2: '09:20 – 10:10', 3: '10:10 – 11:00',
  4: '11:15 – 12:05', 5: '12:05 – 12:55', 6: '01:40 – 02:30',
};

// Deterministic color per subject name (light palette)
const THEORY_PALETTES = [
  'bg-blue-50 text-blue-800 border-blue-200',
  'bg-teal-50 text-teal-800 border-teal-200',
  'bg-violet-50 text-violet-800 border-violet-200',
  'bg-orange-50 text-orange-800 border-orange-200',
  'bg-pink-50 text-pink-800 border-pink-200',
  'bg-sky-50 text-sky-800 border-sky-200',
  'bg-lime-50 text-lime-800 border-lime-200',
  'bg-rose-50 text-rose-800 border-rose-200',
];
const LAB_PALETTE = 'bg-purple-100 text-purple-900 border-purple-300';

function subjectColor(name, isLab) {
  if (!name) return 'bg-gray-50 text-slate-600 font-semibold border-gray-200';
  if (isLab) return LAB_PALETTE;
  let h = 0;
  for (const c of name) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return THEORY_PALETTES[Math.abs(h) % THEORY_PALETTES.length];
}

const STATUS_BADGE = {
  approved: 'badge-green',
  draft:    'badge-blue',
  conflict: 'badge-amber',
};

export default function Timetable() {
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [activeTT, setActiveTT] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(true);
  const [activeLegend, setActiveLegend] = useState(null);

  const loadBatches = useCallback(async () => {
    try { setBatches((await batchesAPI.list()).data); } catch {}
  }, []);

  const loadTimetables = useCallback(async () => {
    try { setTimetables((await timetableAPI.list()).data); } catch {}
  }, []);

  useEffect(() => { loadBatches(); loadTimetables(); }, []);

  const generate = async () => {
    if (selectedBatches.length === 0) { toast.error('Select at least one batch'); return; }
    setGenerating(true);
    toast.loading('Running Genetic Algorithm…', { id: 'gen' });
    try {
      const res = await timetableAPI.generate(selectedBatches);
      const { fitness_score, total_conflicts, conflicts: c, generations_run } = res.data;
      toast.success(
        `Done! Fitness: ${fitness_score?.toFixed(1)} · ${total_conflicts} conflict${total_conflicts !== 1 ? 's' : ''} · ${generations_run} generations`,
        { id: 'gen', duration: 5000 }
      );
      setConflicts(c || []);
      setShowConflicts(c?.length > 0);
      await loadTimetables();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Generation failed', { id: 'gen' });
    }
    setGenerating(false);
  };

  const approve = async (id) => {
    try { await timetableAPI.approve(id); toast.success('Approved!'); loadTimetables(); } catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this timetable?')) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Deleted');
      if (activeTT?._id === id) setActiveTT(null);
      loadTimetables();
    } catch { toast.error('Delete failed'); }
  };

  const viewTT = async (batch_id) => {
    try {
      const r = await timetableAPI.getByBatch(batch_id);
      setActiveTT(r.data);
      setTimeout(() => document.getElementById('timetable-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { toast.error('Timetable not found'); }
  };

  const toggleBatch = (id) =>
    setSelectedBatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const exportPrint = () => {
    window.print();
    toast.success('Print dialog opened — choose "Save as PDF"');
  };

  return (
    <div className="space-y-6 fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar size={24} className="text-blue-500" /> Timetable
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-0.5">Generate and manage weekly schedules</p>
        </div>
        {activeTT && (
          <button onClick={exportPrint} className="btn-secondary no-print">
            <Download size={15} /> Export / Print
          </button>
        )}
      </div>

      {/* ── Generator panel ──────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-amber-500" />
          <h2 className="font-semibold text-slate-900">Generate Timetable</h2>
          <span className="text-sm font-semibold tracking-wide text-slate-600 font-semibold">(Genetic Algorithm · 200 generations)</span>
        </div>

        <div className="mb-5">
          <label className="label">Select Batches</label>
          {batches.length === 0 ? (
            <p className="text-sm text-slate-600 font-semibold bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              No batches found. Add batches first from the Batches menu.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {batches.map(b => (
                <button
                  key={b._id}
                  id={`batch-select-${b._id}`}
                  onClick={() => toggleBatch(b._id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                    ${selectedBatches.includes(b._id)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          id="generate-timetable-btn"
          onClick={generate}
          disabled={generating || selectedBatches.length === 0}
          className="btn-primary"
        >
          {generating
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating…</>
            : <><Zap size={15} /> Generate Timetable</>}
        </button>

        {generating && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              Running genetic algorithm — this may take 15–30 seconds…
            </p>
            <div className="h-1.5 bg-blue-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Conflict alerts ───────────────────────────────────────────── */}
      {conflicts.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
              <AlertTriangle size={15} /> {conflicts.length} scheduling conflict{conflicts.length !== 1 ? 's' : ''} detected
            </span>
            {showConflicts ? <ChevronUp size={14} className="text-amber-500" /> : <ChevronDown size={14} className="text-amber-500" />}
          </button>
          {showConflicts && (
            <div className="px-5 pb-4 space-y-1.5 max-h-48 overflow-y-auto border-t border-amber-200">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-semibold tracking-wide text-amber-700 bg-white/60 rounded-lg px-3 py-2 border border-amber-100">
                  <Info size={11} className="mt-0.5 flex-shrink-0" /> {c}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Timetables list ───────────────────────────────────────────── */}
      {timetables.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-900">Generated Timetables</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {timetables.map(tt => (
              <div key={tt._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{tt.batch_name}</p>
                  <p className="text-sm font-semibold tracking-wide text-slate-600 font-semibold flex items-center gap-2 mt-0.5">
                    <Clock size={10} />
                    {tt.generated_at ? new Date(tt.generated_at).toLocaleString() : '—'}
                    {tt.fitness_score != null && <span>· Fitness: <span className="text-blue-600 font-semibold">{tt.fitness_score.toFixed(1)}</span></span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={STATUS_BADGE[tt.status] || 'badge-gray'}>{tt.status}</span>
                  <button id={`view-tt-${tt._id}`} onClick={() => viewTT(tt.batch_id)} className="btn-secondary text-sm font-semibold tracking-wide py-1.5 px-3">
                    <Eye size={12} /> View
                  </button>
                  {tt.status !== 'approved' && (
                    <button id={`approve-tt-${tt._id}`} onClick={() => approve(tt._id)} className="btn-success text-sm font-semibold tracking-wide py-1.5 px-3">
                      <CheckCircle2 size={12} /> Approve
                    </button>
                  )}
                  <button onClick={() => del(tt._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Timetable grid ────────────────────────────────────────────── */}
      {activeTT && (
        <div id="timetable-grid" className="card">
          {/* Grid header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeTT.batch_name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm font-semibold tracking-wide text-slate-700 font-semibold">
                <span>Fitness Score: <span className="text-blue-600 font-semibold">{activeTT.fitness_score?.toFixed(2)}</span></span>
                {activeTT.conflicts?.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle size={11} /> {activeTT.conflicts.length} conflict{activeTT.conflicts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <span className={STATUS_BADGE[activeTT.status] || 'badge-gray'}>{activeTT.status}</span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-600">
              <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200" />
              Theory
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-600">
              <div className="w-5 h-5 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center">
                <FlaskConical size={9} className="text-purple-600" />
              </div>
              Lab
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-600">
              <div className="w-5 h-5 rounded-md bg-gray-50 border border-gray-200" />
              Free slot
            </div>
          </div>

          {/* Grid table */}
          <TimetableGrid schedule={activeTT.week_schedule} />
        </div>
      )}
    </div>
  );
}

/* ── Timetable Grid Component ─────────────────────────────────────────── */
function TimetableGrid({ schedule }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full border-collapse min-w-[720px]">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide font-semibold text-slate-700 font-semibold w-28">Day</th>
            {[1,2,3,4,5,6].map(s => (
              <th key={s} className="px-2 py-3 text-center">
                <div className="text-sm font-semibold tracking-wide font-semibold text-gray-700">Period {s}</div>
                <div className="text-xs font-bold tracking-wider text-slate-600 font-semibold font-normal mt-0.5">{SLOT_TIMES[s]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, di) => {
            const slots = (schedule?.[day] || []).sort((a, b) => a.slot - b.slot);
            return (
              <tr key={day} className={`border-b border-gray-100 ${di % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                <td className="px-4 py-2.5">
                  <div className="text-sm font-semibold tracking-wide font-bold text-gray-700">{day}</div>
                  <div className="text-xs font-bold tracking-wider text-slate-600 font-semibold">{DAY_FULL[day]}</div>
                </td>
                {[1,2,3,4,5,6].map(slotNum => {
                  const slot = slots.find(s => s.slot === slotNum);
                  const isEmpty = !slot || slot.is_free || !slot.subject_name;
                  const colorClass = isEmpty
                    ? 'bg-gray-50 text-slate-600 font-semibold border-gray-200'
                    : subjectColor(slot.subject_name, slot.is_lab);

                  return (
                    <td key={slotNum} className="px-2 py-2">
                      <div className={`rounded-xl p-2.5 border min-h-[66px] flex flex-col gap-0.5 text-xs
                        transition-shadow hover:shadow-sm
                        ${colorClass}`}
                      >
                        {isEmpty ? (
                          <span className="m-auto text-slate-500 font-semibold text-xs font-bold tracking-wider">—</span>
                        ) : (
                          <>
                            <span className="font-semibold leading-tight line-clamp-2">{slot.subject_name}</span>
                            {slot.subject_code && <span className="text-xs font-bold tracking-wider opacity-60">{slot.subject_code}</span>}
                            <span className="text-xs font-bold tracking-wider opacity-70 flex items-center gap-1 mt-auto">
                              {slot.is_lab && <FlaskConical size={9} />}
                              {slot.faculty_name}
                            </span>
                            <span className="text-xs font-bold tracking-wider opacity-50">🚪 {slot.room_name}</span>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
