import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { PawPrint, Loader2, ArrowLeft } from 'lucide-react';

export const PetForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'cachorro',
    breed: '',
    color: '',
    weight: '',
    features: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('pets').insert([
        {
          user_id: user.id,
          name: formData.name,
          species: formData.species,
          breed: formData.breed || null,
          color: formData.color || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          features: formData.features || null,
        },
      ]);

      if (insertError) throw insertError;
      
      navigate('/app/pets');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar o pet. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/app/pets')} className="mr-4 text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Novo Pet</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                placeholder="Ex: Rex"
              />
            </div>

            {/* Espécie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <select
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white"
              >
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
                <option value="passaro">Pássaro</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Raça */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                placeholder="Ex: Golden Retriever"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor Predominante</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                placeholder="Ex: Caramelo"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                placeholder="Ex: 15.5"
              />
            </div>

            {/* Características marcantes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Características marcantes (Importante para IA)</label>
              <textarea
                name="features"
                rows={3}
                value={formData.features}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                placeholder="Ex: Mancha preta no olho esquerdo, pata direita branca..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Essas informações ajudam a inteligência artificial a reconhecer seu pet pelas câmeras.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/app/pets')}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg shadow-sm transition font-medium flex items-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <PawPrint size={18} className="mr-2" />}
              {loading ? 'Salvando...' : 'Salvar Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
