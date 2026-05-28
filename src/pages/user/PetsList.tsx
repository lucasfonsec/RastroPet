import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Pet } from '../../types';
import { Plus, PawPrint, AlertCircle, Loader2 } from 'lucide-react';

export const PetsList: React.FC = () => {
  const { user } = useAuthStore();
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
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Meus Pets</h1>
          <p className="text-gray-500 mt-1">Gerencie e monitore seus animais</p>
        </div>
        <Link
          to="/app/pets/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-brand transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Adicionar Pet
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-500" size={36} />
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white py-16 text-center rounded-2xl border border-gray-100 shadow-card">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <PawPrint size={36} className="text-brand-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum pet cadastrado ainda</h3>
          <p className="text-gray-500 mb-7 max-w-xs mx-auto">
            Cadastre seu primeiro pet e deixe nossa IA protegê-lo.
          </p>
          <Link
            to="/app/pets/new"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-brand transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Adicionar Pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              to={`/app/pets/${pet.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-cream-200 overflow-hidden">
                {pet.status === 'lost' && (
                  <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-center font-black py-1.5 uppercase tracking-wider text-xs z-10 flex items-center justify-center gap-1 animate-pulse">
                    <AlertCircle size={12} />
                    Perdido
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

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
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
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}
                </p>
              </div>
            </Link>
          ))}

          {/* Add more */}
          <Link
            to="/app/pets/new"
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 min-h-[236px] flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-14 h-14 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
              <Plus size={24} className="text-brand-400 group-hover:text-brand-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-600 group-hover:text-brand-500 transition-colors text-sm">Adicionar Pet</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
