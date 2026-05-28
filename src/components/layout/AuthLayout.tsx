import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { PawPrint } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { user, profile, isLoading } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Track current and previous views for animation
  const [activeView, setActiveView] = useState<'login' | 'register'>(
    location.pathname === '/register' ? 'register' : 'login'
  );
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Sync URL changes to activeView
  useEffect(() => {
    const newView = location.pathname === '/register' ? 'register' : 'login';
    if (newView !== activeView) {
      setDirection(newView === 'register' ? 'forward' : 'back');
      setAnimating(true);
      setTimeout(() => {
        setActiveView(newView);
        setAnimating(false);
      }, 350);
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center animate-pulse">
            <PawPrint size={24} className="text-white" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/app'} replace />;
  }

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  // Animation classes
  const getAnimClass = () => {
    if (!animating) return '';
    return direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  };

  const getEnterClass = () => {
    return direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  };

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-brand-400 rounded-full opacity-40" />
        <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-brand-600 rounded-full opacity-40" />
        <div className="absolute top-10 right-10 w-24 h-24 bg-brand-300 rounded-full opacity-30 animate-float" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/30">
            <PawPrint size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            RastroPet
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed max-w-xs">
            Encontramos seu pet perdido com Inteligência Artificial e câmeras de segurança.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { v: '2.4k', l: 'Encontrados' },
              { v: '187', l: 'Avistamentos' },
              { v: '42', l: 'Câmeras' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-xs text-brand-200 mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Pet photos */}
          <div className="mt-12 flex gap-3 justify-center">
            {[
              'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop',
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop',
              'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=80&h=80&fit=crop',
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-white/60 shadow-lg"
              />
            ))}
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white text-xs font-bold">
              +200
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <PawPrint size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">RastroPet</h2>
          </div>

          <div className="overflow-hidden">
            <div className={animating ? getAnimClass() : getEnterClass()}>
              <Outlet context={{ onSwitchToRegister: handleSwitchToRegister, onSwitchToLogin: handleSwitchToLogin }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
