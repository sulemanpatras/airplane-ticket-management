'use client';
import { useState, useEffect, useRef } from 'react';
import { flightsAPI, ticketsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Search, MapPin, Clock, Users, X, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function SearchPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const { user, isLoading } = useAuth();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingFlight, setBookingFlight] = useState<any>(null);
  const [passengerName, setPassengerName] = useState('');
  const [booking, setBooking] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<any>(null);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
  const [calendarPolling, setCalendarPolling] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);  // to clear poll on modal close

  useEffect(() => {
    if (isLoading) return;
    flightsAPI.getAll().then(r => setFlights(r.data));
    if (user) setPassengerName(user.fullName);
  }, [user, isLoading]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await flightsAPI.search(source || undefined, destination || undefined);
      setFlights(res.data);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    // Stop polling if user closes modal early
    if (pollRef.current) clearInterval(pollRef.current);
    setBookingFlight(null);
    setConfirmedTicket(null);
    setCalendarUrl(null);
    setCalendarPolling(false);
  };

  const pollForCalendarUrl = (ticketId: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 24 × 5s = 2 minutes max

    setCalendarPolling(true);

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await ticketsAPI.myTickets();
        const updated = res.data.find((t: any) => t.id === ticketId);

        if (updated?.calendarEventUrl) {
          setCalendarUrl(updated.calendarEventUrl);
          setCalendarPolling(false);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (attempts >= maxAttempts) {
          // Gave up after 2 minutes — calendar sync likely failed
          setCalendarPolling(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        setCalendarPolling(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 5000);
  };

  const handleBook = async () => {
    if (!bookingFlight || !passengerName.trim()) return;
    setBooking(true);
    try {
      const res = await ticketsAPI.book(bookingFlight.id, passengerName.trim());
      const ticket = res.data;

      setConfirmedTicket(ticket);
      toast.success('Ticket booked!');
      flightsAPI.getAll().then(r => setFlights(r.data));
      console.log('Booked ticket:', ticket, 'Calendar URL:', ticket.calendarEventUrl, 'Auth URL:', ticket.authUrl);
      if (ticket.calendarEventUrl) {
        setCalendarUrl(ticket.calendarEventUrl);
      } else {
        if (ticket.authUrl) {
          toast.info('Redirecting to Google for one-time calendar authorization...');
          window.open(ticket.authUrl, '_blank');
        }
        // First-time OAuth is happening in background — start polling
        pollForCalendarUrl(ticket.id);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Search Flights</h1>
        <p className="text-slate-500 mt-1">Find and book your next adventure</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From (e.g. Karachi)"
            value={source}
            onChange={e => setSource(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To (e.g. Dubai)"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Flight cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {flights.map((f: any) => (
          <div key={f.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500 font-medium">{f.airline}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                f.seatsAvailable < 5 ? 'bg-red-100 text-red-700' :
                f.seatsAvailable < 15 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                <Users className="h-3 w-3 inline mr-1" />
                {f.seatsAvailable} seats
              </span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{format(new Date(f.departureTime), 'HH:mm')}</p>
                <p className="text-xs text-slate-500">{f.source}</p>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-blue-600">✈</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{format(new Date(f.arrivalTime), 'HH:mm')}</p>
                <p className="text-xs text-slate-500">{f.destination}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {format(new Date(f.departureTime), 'dd MMM yyyy')}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-blue-700">${f.price}</span>
                {f.seatsAvailable > 0 ? (
                  <button
                    onClick={() => setBookingFlight(f)}
                    className="px-3 py-1.5 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Book Now
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Full</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {flights.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 text-slate-400">
            No flights found. Try adjusting your search.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {confirmedTicket ? 'Booking Confirmed' : 'Book Flight'}
                </h2>
                <p className="text-sm text-slate-500">
                  {bookingFlight.source} → {bookingFlight.destination} · ${bookingFlight.price}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* After booking: confirmation view */}
            {confirmedTicket ? (
              <div className="space-y-3">

                {/* Ticket summary */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Booking confirmed!
                  </div>
                  <div className="text-slate-600 space-y-1">
                    <p><span className="text-slate-400">Ticket</span> {confirmedTicket.id}</p>
                    <p><span className="text-slate-400">Passenger</span> {confirmedTicket.passengerName}</p>
                    <p><span className="text-slate-400">Seat</span> {confirmedTicket.seatNumber}</p>
                  </div>
                </div>

                {/* Status lines */}
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
                  <p>✅ Confirmation email + PDF ticket sent</p>
                  {calendarUrl
                    ? <p>📅 Flight added to Google Calendar</p>
                    : calendarPolling
                      ? <p className="text-slate-400">📅 Adding to Google Calendar...</p>
                      : <p className="text-slate-400">📅 Calendar sync unavailable</p>
                  }
                </div>

                {/* Spinner while waiting for OAuth + event creation */}
                {calendarPolling && !calendarUrl && (
                  <div className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-50
                                  border border-slate-200 text-slate-500 text-sm rounded-xl">
                    <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent
                                    rounded-full animate-spin flex-shrink-0" />
                    Waiting for Google Calendar authorization...
                  </div>
                )}

                {/* Calendar link — appears as soon as URL is available */}
                {calendarUrl && (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5
                               bg-white border border-blue-300 text-blue-700 text-sm font-medium
                               rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    View in Google Calendar
                  </a>
                )}

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 bg-slate-800 text-white text-sm font-medium
                             rounded-xl hover:bg-slate-900 transition-colors"
                >
                  Done
                </button>
              </div>

            ) : (
              /* Before booking: passenger name + confirm button */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Passenger Name
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passengerName}
                    onChange={e => setPassengerName(e.target.value)}
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                  ✅ A confirmation email + PDF ticket will be sent<br />
                  📅 Flight will be added to your Google Calendar
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 border border-slate-300 text-slate-700 text-sm
                               rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={booking || !passengerName.trim()}
                    className="flex-1 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg
                               hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {booking ? 'Booking...' : (
                      <><CheckCircle className="h-4 w-4" /> Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}