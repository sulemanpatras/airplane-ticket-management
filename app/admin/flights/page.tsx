'use client';
import { useState, useEffect } from 'react';
import { flightsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = {
  airline: '', source: '', destination: '',
  departureTime: '', arrivalTime: '',
  price: 0, seatsAvailable: 0, totalSeats: 0
};

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => flightsAPI.getAll().then(r => setFlights(r.data));
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (f: any) => {
    setEditing(f);
    setForm({
      ...f,
      departureTime: f.departureTime?.slice(0, 16),
      arrivalTime: f.arrivalTime?.slice(0, 16),
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.airline || !form.source || !form.destination) {
      toast.error('Fill all required fields.'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await flightsAPI.update(editing.id, form);
        toast.success('Flight updated.');
      } else {
        await flightsAPI.create(form);
        toast.success('Flight added.');
      }
      setDialog(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flight?')) return;
    try {
      await flightsAPI.delete(id);
      toast.info('Flight deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Flights</h1>
          <p className="text-slate-500 mt-1">Add, edit, and remove flights</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" /> Add Flight
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['ID', 'Airline', 'Route', 'Departure', 'Price', 'Seats', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flights.map((f: any) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{f.id}</td>
                <td className="px-4 py-3 font-medium">{f.airline}</td>
                <td className="px-4 py-3 text-slate-600">{f.source} → {f.destination}</td>
                <td className="px-4 py-3 text-slate-500">
                  {format(new Date(f.departureTime), 'dd MMM, HH:mm')}
                </td>
                <td className="px-4 py-3 font-semibold text-blue-700">${f.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    f.seatsAvailable < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {f.seatsAvailable}/{f.totalSeats}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(f)} className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {flights.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No flights.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {dialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editing ? 'Edit Flight' : 'Add Flight'}</h2>
              <button onClick={() => setDialog(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Airline *</label>
                <input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.airline} onChange={e => set('airline', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Source *</label>
                  <input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.source} onChange={e => set('source', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Destination *</label>
                  <input className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.destination} onChange={e => set('destination', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Departure</label>
                  <input type="datetime-local" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.departureTime} onChange={e => set('departureTime', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Arrival</label>
                  <input type="datetime-local" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Price (USD)</label>
                  <input type="number" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.price} onChange={e => set('price', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Avail. Seats</label>
                  <input type="number" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.seatsAvailable} onChange={e => set('seatsAvailable', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Total Seats</label>
                  <input type="number" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.totalSeats} onChange={e => set('totalSeats', Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setDialog(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Flight'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
