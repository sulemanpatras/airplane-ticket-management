'use client';
import { useEffect, useState } from 'react';
import { flightsAPI, ticketsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plane, Ticket, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [flights, setFlights] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    flightsAPI.getAll().then(r => setFlights(r.data)).catch(() => {});
    const ticketCall = isAdmin ? ticketsAPI.allTickets() : ticketsAPI.myTickets();
    ticketCall.then(r => setTickets(r.data)).catch(() => {});
  }, [isAdmin]);

  const confirmed = tickets.filter(t => t.status === 'CONFIRMED').length;
  const revenue = tickets
    .filter(t => t.status === 'CONFIRMED')
    .reduce((a: number, t: any) => a + (t.price || 0), 0);

  const stats = [
    { label: 'Total Flights', value: flights.length, icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: isAdmin ? 'Total Bookings' : 'My Bookings', value: confirmed, icon: Ticket, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Available Seats', value: flights.reduce((a: number, f: any) => a + f.seatsAvailable, 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: isAdmin ? 'Revenue (USD)' : 'Total Spent', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome, {user?.fullName?.split(' ')[0]}! ✈️
        </h1>
        <p className="text-slate-500 mt-1">Here's your SkyBook overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`${s.bg} p-2 rounded-lg`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 text-lg mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/search" className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors">
            Search Flights
          </a>
          <a href="/bookings" className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors">
            My Bookings
          </a>
          {isAdmin && (
            <a href="/admin/flights" className="px-4 py-2 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition-colors">
              Manage Flights
            </a>
          )}
        </div>
      </div>

      {/* Recent Flights */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Available Flights</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {flights.slice(0, 5).map((f: any) => (
            <div key={f.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800">{f.source} → {f.destination}</span>
                <span className="ml-2 text-sm text-slate-500">{f.airline}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">{f.seatsAvailable} seats</span>
                <span className="font-semibold text-blue-700">${f.price}</span>
              </div>
            </div>
          ))}
          {flights.length === 0 && (
            <p className="px-6 py-8 text-center text-slate-400">No flights available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
