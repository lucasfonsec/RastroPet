import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { PawPrint, LogOut, Home, AlertCircle, Activity, Camera, MapPin, Menu } from 'lucide-react';
import { useState } from 'react';

export const DashboardLayout: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const userLinks = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Meus Pets', href: '/app/pets', icon: PawPrint },
    { name: 'Alertas / Mapa', href: '/app/alerts', icon: MapPin },
  ];

  const adminLinks = [
    { name: 'Painel Admin', href: '/admin', icon: Activity },
    { name: 'Câmeras', href: '/admin/cameras', icon: Camera },
    { name: 'Alertas', href: '/admin/alerts', icon: AlertCircle },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const isActive = (href: string) => {
    if (href === '/app' || href === '/admin') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-950 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2.5">
          <PawPrint size={18} className="text-white" />
        </div>
        <span className="text-lg font-black text-white">RastroPet</span>
        {isAdmin && (
          <span className="ml-auto text-xs bg-brand-500/20 text-brand-400 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
            Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          {isAdmin ? 'Administração' : 'Menu principal'}
        </p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={`mr-3 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-9 w-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-black text-sm flex-shrink-0 border border-brand-500/30">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center px-3 py-2 text-sm font-semibold text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} className="mr-3 text-red-400" />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-cream-100">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden h-14 bg-gray-950 flex items-center px-4 gap-3 border-b border-white/10">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white transition">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <PawPrint size={18} className="text-brand-500" />
            <span className="font-black text-white">RastroPet</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
