import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Pet } from '../../types';
import { Plus, PawPrint, AlertCircle } from 'lucide-react';

export const PetsList: React.FC = () => {
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Pets</h1>
        <Link
          to="/app/pets/new"
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Pet
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <PawPrint size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-gray-500 mb-6">Cadastre seu primeiro pet para começar a mantê-lo seguro.</p>
          <Link
            to="/app/pets/new"
            className="text-brand-600 hover:text-brand-700 font-medium bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition"
          >
            Adicionar Pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              to={`/app/pets/${pet.id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group relative"
            >
              {pet.status === 'lost' && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> PERDIDO
                </div>
              )}
              
              <div className="h-48 bg-gray-100 relative">
                {pet.image_url ? (
                  <img
                    src={pet.image_url}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PawPrint size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{pet.species}{pet.breed ? ` • ${pet.breed}` : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
