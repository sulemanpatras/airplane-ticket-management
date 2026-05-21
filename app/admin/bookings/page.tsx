'use client';
import { useState, useEffect } from 'react';
import { ticketsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBookingsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsAPI.allTickets()
      .then(r => setTickets(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">All Bookings</h1>
        <p className="text-slate-500 mt-1">{tickets.length} total bookings</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Ticket', 'Passenger', 'Flight', 'Route', 'Departure', 'Seat', 'Price', 'Status', 'PDF'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t: any) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                <td className="px-4 py-3 font-medium">{t.passengerName}</td>
                <td className="px-4 py-3 text-slate-500">{t.flightId}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.source} → {t.destination}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {format(new Date(t.departureTime), 'dd MMM, HH:mm')}
                </td>
                <td className="px-4 py-3">{t.seatNumber}</td>
                <td className="px-4 py-3 font-semibold text-blue-700">${t.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => ticketsAPI.downloadPdf(t.id).then(() => toast.success('PDF downloaded')).catch(() => toast.error('Failed'))}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
