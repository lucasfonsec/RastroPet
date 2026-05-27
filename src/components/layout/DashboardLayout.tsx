import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { PawPrint, LogOut, Home, Camera, AlertCircle, User, Activity } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const location = useLocation();

  const isAdmin = profile?.role === 'admin';

  const userLinks = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Meus Pets', href: '/app/pets', icon: PawPrint },
    { name: 'Alerta Perdido', href: '/app/alerts', icon: AlertCircle },
    { name: 'Perfil', href: '/app/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Painel', href: '/admin', icon: Activity },
    { name: 'Câmeras', href: '/admin/cameras', icon: Camera },
    { name: 'Alertas', href: '/admin/alerts', icon: AlertCircle },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <PawPrint className="text-brand-600 mr-2" size={24} />
          <span className="text-xl font-bold text-gray-900">RastroPet</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4 px-3">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate w-32">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header can be added here */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
