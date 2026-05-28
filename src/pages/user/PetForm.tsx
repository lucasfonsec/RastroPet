import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { PawPrint, Loader2, ArrowLeft, Camera, X, Cpu } from 'lucide-react';

export const PetForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    species: 'cachorro',
    breed: '',
    color: '',
    weight: '',
    neighborhood: '',
    city: '',
    features: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (petId: string): Promise<string | null> => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${user!.id}/${petId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('pets_images')
        .upload(path, imageFile, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('pets_images').getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Insert pet first to get ID
      const { data: petData, error: insertError } = await supabase
        .from('pets')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            species: formData.species,
            breed: formData.breed || null,
            color: formData.color || null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            features: formData.features || null,
            status: 'safe',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Upload image and update record if there's a photo
      if (imageFile && petData) {
        const imageUrl = await uploadImage(petData.id);
        if (imageUrl) {
          await supabase.from('pets').update({ image_url: imageUrl }).eq('id', petData.id);
        }
      }

      navigate('/app/pets');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar o pet. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/app/pets')}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition shadow-card"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Meus pets</h1>
          <p className="text-sm text-gray-500">Gerencie seus animais e ative alertas de fuga.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {/* Section title */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <PawPrint size={18} className="text-brand-500" />
            Informações do pet
          </h2>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo upload */}
          <div>
            {!imagePreview ? (
              <label
                htmlFor="pet-photo"
                className="block w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
              >
                <div className="w-14 h-14 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors border border-brand-100">
                  <Camera size={26} className="text-brand-500" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-brand-500 group-hover:text-brand-600">Clique para enviar</span>{' '}
                  a foto do pet
                </p>
                <p className="text-xs text-gray-400 mt-1">Será usada pela IA na busca</p>
                <input
                  id="pet-photo"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-square max-w-sm mx-auto">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 px-4 py-3">
                  <p className="text-white text-sm font-semibold">📸 Foto selecionada — será usada pela IA</p>
                </div>
              </div>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do pet *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: Rex"
              />
            </div>

            {/* Espécie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Espécie *</label>
              <select
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition appearance-none"
              >
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
                <option value="passaro">Pássaro</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Raça */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Raça</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: Labrador"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cor</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: Caramelo"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: 15.5"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: Centro"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Ex: Franca"
              />
            </div>

            {/* Características */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Características marcantes
              </label>
              <textarea
                name="features"
                rows={3}
                value={formData.features}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400 resize-none"
                placeholder="Ex: Mancha preta no olho esquerdo, pata direita branca..."
              />
            </div>
          </div>

          {/* IA Banner */}
          <div className="bg-teal-600 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Análise por IA ativada</p>
              <p className="text-teal-100 text-xs mt-0.5 leading-relaxed">
                Após o cadastro, ao ativar fuga, a IA vasculha câmeras parceiras na região para localizar seu pet.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/app/pets')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-card"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-brand transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading || uploadingImage ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <PawPrint size={18} />
              )}
              {loading ? 'Salvando...' : uploadingImage ? 'Enviando foto...' : 'Cadastrar pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
