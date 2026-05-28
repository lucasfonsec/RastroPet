import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Syringe, Loader2, Calendar } from 'lucide-react';

interface VaccineModalProps {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VaccineModal: React.FC<VaccineModalProps> = ({ petId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date_given: '',
    next_due: '',
    veterinarian: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('vaccines').insert([
        {
          pet_id: petId,
          name: formData.name,
          date_given: formData.date_given,
          next_due: formData.next_due || null,
          veterinarian: formData.veterinarian || null,
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar vacina:', err);
      setError('Não foi possível salvar a vacina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              <Syringe size={18} className="text-brand-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Adicionar Vacina</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Nome da vacina */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da vacina *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
              placeholder="Ex: V10, Antirrábica, Giárdia..."
            />
          </div>

          {/* Data de aplicação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1 text-gray-400" />
              Data de aplicação *
            </label>
            <input
              type="date"
              name="date_given"
              required
              value={formData.date_given}
              onChange={handleChange}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
            />
          </div>

          {/* Próxima dose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1 text-gray-400" />
              Próxima dose (opcional)
            </label>
            <input
              type="date"
              name="next_due"
              value={formData.next_due}
              onChange={handleChange}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
            />
          </div>

          {/* Veterinário */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Veterinário (opcional)
            </label>
            <input
              type="text"
              name="veterinarian"
              value={formData.veterinarian}
              onChange={handleChange}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition placeholder-gray-400"
              placeholder="Dr. João Silva"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 font-bold text-sm rounded-xl shadow-brand transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Syringe size={16} />}
              {loading ? 'Salvando...' : 'Salvar vacina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
