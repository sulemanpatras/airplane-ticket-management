'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard, Search, Ticket, Plane, ClipboardList, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const passengerNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Search Flights', href: '/search', icon: Search },
  { label: 'My Bookings', href: '/bookings', icon: Ticket },
];
const adminNav = [
  { label: 'Manage Flights', href: '/admin/flights', icon: Plane },
  { label: 'All Bookings', href: '/admin/bookings', icon: ClipboardList },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('Auth state changed:', { user, isLoading });
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  if (isLoading) return null; // or a loading spinner
  if (!user) return null;

  const handleLogout = () => { 
    logout();
    toast.info('Logged out.');
    router.push('/auth');
  };

  const NavItem = ({ href, label, icon: Icon }: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        pathname === href
          ? 'bg-blue-700 text-white font-medium'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-200">
        <div className="h-8 w-8 rounded-lg bg-blue-700 flex items-center justify-center">
          <Plane className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-blue-700 text-lg">SkyBook</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase px-3 mb-2">Passenger</p>
        {passengerNav.map(item => <NavItem key={item.href} {...item} />)}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase px-3 mt-4 mb-2">Admin</p>
            {adminNav.map(item => <NavItem key={item.href} {...item} />)}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-slate-800">{user.fullName}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed inset-y-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <span className="font-bold text-blue-700">SkyBook</span>
        </header>

        <main className="p-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
