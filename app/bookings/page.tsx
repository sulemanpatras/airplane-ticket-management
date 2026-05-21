'use client';
import { useState, useEffect } from 'react';
import { ticketsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Ticket, XCircle, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = () => {
    setLoading(true);
    ticketsAPI.myTickets()
      .then(r => setTickets(r.data))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadTickets, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this ticket?')) return;
    try {
      await ticketsAPI.cancel(id);
      toast.success('Ticket cancelled.');
      loadTickets();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Cancellation failed.');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await ticketsAPI.downloadPdf(id);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Download failed.');
    }
  };

  if (loading) return <div className="text-center py-16 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-slate-500 mt-1">View and manage your tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Ticket className="mx-auto h-14 w-14 mb-4 opacity-30" />
          <p className="text-lg">No bookings yet.</p>
          <a href="/search" className="mt-3 inline-block text-blue-700 text-sm hover:underline">
            Search for flights →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-800">{t.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span>{t.source}</span>
                    <span className="text-blue-500">→</span>
                    <span>{t.destination}</span>
                    <span className="text-slate-400 text-sm">· {t.airline}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      <Calendar className="h-3.5 w-3.5 inline mr-1" />
                      {format(new Date(t.departureTime), 'dd MMM yyyy, HH:mm')}
                    </span>
                    <span>Seat <strong>{t.seatNumber}</strong></span>
                    <span>USD <strong>${t.price}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </button>
                  {t.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
