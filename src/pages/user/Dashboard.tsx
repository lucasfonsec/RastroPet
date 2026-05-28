import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Pet } from '../../types';
import {
  PawPrint, Plus, AlertTriangle, Shield, Eye, ArrowRight, Loader2
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (err) {
      console.error('Erro ao buscar pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const safePets = pets.filter((p) => p.status === 'safe');
  const lostPets = pets.filter((p) => p.status === 'lost');

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Olá, {profile?.full_name?.split(' ')[0] || 'Tutor'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Gerencie seus pets e acompanhe as buscas em tempo real.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total de Pets',
            value: pets.length,
            icon: PawPrint,
            color: 'bg-brand-50 text-brand-500 border-brand-100',
            iconBg: 'bg-brand-100',
          },
          {
            label: 'Pets Seguros',
            value: safePets.length,
            icon: Shield,
            color: 'bg-green-50 text-green-600 border-green-100',
            iconBg: 'bg-green-100',
          },
          {
            label: 'Alertas Ativos',
            value: lostPets.length,
            icon: AlertTriangle,
            color: lostPets.length > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100',
            iconBg: lostPets.length > 0 ? 'bg-red-100' : 'bg-gray-100',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl p-5 border shadow-card flex items-center gap-4 ${stat.color.split(' ')[2] || 'border-gray-100'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                <Icon size={22} className={stat.color.split(' ')[1]} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pets section */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-gray-900">Meus Pets</h2>
        <Link
          to="/app/pets/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-brand transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Cadastrar Pet
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <PawPrint size={36} className="text-brand-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-gray-500 mb-6 max-w-xs mx-auto">
            Cadastre seu primeiro pet para mantê-lo protegido pela nossa IA.
          </p>
          <Link
            to="/app/pets/new"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-brand transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Cadastrar primeiro pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
            >
              {/* Pet image */}
              <div className="relative aspect-square bg-cream-200 overflow-hidden">
                {pet.status === 'lost' && (
                  <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-xs font-black py-1 text-center uppercase tracking-wider z-10 animate-pulse">
                    ⚠ Alerta Ativo — Perdido
                  </div>
                )}
                {pet.image_url ? (
                  <img
                    src={pet.image_url}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop&auto=format" 
                    alt="Sem foto" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70" 
                  />
                )}
              </div>

              {/* Pet info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-gray-900">{pet.name}</h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      pet.status === 'safe'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {pet.status === 'safe' ? '✓ Seguro' : '! Perdido'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 capitalize mb-4">
                  {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link
                    to={`/app/pets/${pet.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2 rounded-xl border border-gray-200 transition-colors"
                  >
                    <Eye size={14} />
                    Ver Perfil
                  </Link>
                  {pet.status === 'safe' ? (
                    <Link
                      to={`/app/pets/${pet.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 rounded-xl border border-red-100 transition-colors"
                    >
                      <AlertTriangle size={14} />
                      Acionar Alerta
                    </Link>
                  ) : (
                    <Link
                      to="/app/alerts"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      <ArrowRight size={14} />
                      Acompanhar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add more card */}
          <Link
            to="/app/pets/new"
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-3 group min-h-[280px]"
          >
            <div className="w-14 h-14 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
              <Plus size={24} className="text-brand-400 group-hover:text-brand-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-600 group-hover:text-brand-500 transition-colors">Adicionar Pet</p>
              <p className="text-xs text-gray-400 mt-1">Cadastre mais um pet</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
