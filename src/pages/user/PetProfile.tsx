import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Pet } from '../../types';
import { VaccineModal } from '../../components/VaccineModal';
import {
  AlertTriangle, ArrowLeft, Trash2,
  Syringe, Plus, Loader2, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
  date_given: string;
  next_due: string | null;
  veterinarian: string | null;
}

export const PetProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingAlert, setActivatingAlert] = useState(false);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [deletingPet, setDeletingPet] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPet();
      fetchVaccines();
    }
  }, [id]);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error) {
      console.error('Erro ao buscar pet:', error);
      navigate('/app/pets');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const { data } = await supabase
        .from('vaccines')
        .select('*')
        .eq('pet_id', id)
        .order('date_given', { ascending: false });
      setVaccines(data || []);
    } catch (err) {
      console.error('Erro ao buscar vacinas:', err);
    }
  };

  const handleActivateAlert = async () => {
    if (!pet) return;
    const confirm = window.confirm(
      'TEM CERTEZA QUE DESEJA EMITIR UM ALERTA DE PERDIDO?\n\nIsso acionará a IA para procurar seu pet nas câmeras de segurança da rede.'
    );
    if (!confirm) return;

    setActivatingAlert(true);
    try {
      const { error: updateError } = await supabase
        .from('pets')
        .update({ status: 'lost' })
        .eq('id', pet.id);
      if (updateError) throw updateError;

      const { error: alertError } = await supabase.from('lost_alerts').insert([
        {
          pet_id: pet.id,
          user_id: pet.user_id,
          description: `Buscando por ${pet.name}. ${pet.features || ''}`,
          status: 'active',
        },
      ]);
      if (alertError) throw alertError;

      setPet({ ...pet, status: 'lost' });
      alert('✅ Alerta ativado! A IA já começou as buscas nas câmeras de segurança.');
    } catch (error) {
      console.error('Erro ao ativar alerta:', error);
      alert('Houve um erro ao ativar o alerta. Tente novamente.');
    } finally {
      setActivatingAlert(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!pet) return;
    const confirm = window.confirm('Deseja marcar este pet como encontrado? O alerta de busca será encerrado.');
    if (!confirm) return;

    setActivatingAlert(true);
    try {
      const { error: updateError } = await supabase
        .from('pets')
        .update({ status: 'safe' })
        .eq('id', pet.id);
      if (updateError) throw updateError;

      const { error: alertError } = await supabase
        .from('lost_alerts')
        .update({ status: 'resolved' })
        .eq('pet_id', pet.id)
        .eq('status', 'active');
      if (alertError) throw alertError;

      setPet({ ...pet, status: 'safe' });
      alert('🎉 Que ótima notícia! O pet foi marcado como seguro.');
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      alert('Houve um erro ao atualizar o status. Tente novamente.');
    } finally {
      setActivatingAlert(false);
    }
  };

  const handleDeletePet = async () => {
    if (!pet) return;
    const confirm = window.confirm(
      `Tem certeza que deseja remover ${pet.name}? Esta ação não pode ser desfeita.`
    );
    if (!confirm) return;

    setDeletingPet(true);
    try {
      const { error } = await supabase.from('pets').delete().eq('id', pet.id);
      if (error) throw error;
      navigate('/app/pets');
    } catch (err) {
      console.error('Erro ao deletar pet:', err);
      alert('Erro ao remover o pet.');
    } finally {
      setDeletingPet(false);
    }
  };

  const getVaccineStatus = (vaccine: Vaccine) => {
    if (!vaccine.next_due) return { label: 'Sem reforço', color: 'bg-gray-100 text-gray-500', icon: CheckCircle };
    const nextDue = new Date(vaccine.next_due);
    const today = new Date();
    const diffDays = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Vencida', color: 'bg-red-100 text-red-600', icon: AlertCircle };
    if (diffDays <= 30) return { label: `Vence em ${diffDays}d`, color: 'bg-yellow-100 text-yellow-600', icon: Clock };
    return { label: 'Em dia', color: 'bg-green-100 text-green-700', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-brand-500" size={36} />
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/app/pets"
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition shadow-card"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Perfil do Pet</h1>
            <p className="text-sm text-gray-500">{pet.name} • {pet.species}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeletePet}
            disabled={deletingPet}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition shadow-card"
          >
            {deletingPet ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1 space-y-5">
          {/* Pet photo card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="aspect-square bg-cream-200 relative">
              {pet.status === 'lost' && (
                <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-center font-black py-2 uppercase tracking-wider text-xs animate-pulse z-10">
                  ⚠ Alerta de Perdido Ativo
                </div>
              )}
              {pet.image_url ? (
                <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop&auto=format" 
                  alt="Sem foto" 
                  className="w-full h-full object-cover opacity-70" 
                />
              )}
            </div>
            <div className="p-5 text-center">
              <h2 className="text-2xl font-black text-gray-900">{pet.name}</h2>
              <p className="text-gray-500 capitalize mt-1">{pet.species}</p>
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                  pet.status === 'safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {pet.status === 'safe' ? '✓ Seguro' : '! Perdido'}
              </span>
            </div>
          </div>

          {/* Alert button */}
          {pet.status === 'safe' ? (
            <button
              onClick={handleActivateAlert}
              disabled={activatingAlert}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center gap-2 group"
            >
              {activatingAlert ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <AlertTriangle size={28} className="group-hover:scale-110 transition-transform" />
              )}
              <span className="text-base">Acionar Alerta de Perdido</span>
              <span className="text-xs font-normal text-red-100">Inicia busca por IA nas câmeras</span>
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertTriangle size={32} className="text-red-500 animate-pulse mx-auto mb-3" />
              <h3 className="text-red-800 font-black text-lg mb-1">Busca em Andamento</h3>
              <p className="text-sm text-red-600 mb-4">A IA está analisando câmeras de segurança.</p>
              
              <div className="flex flex-col gap-2">
                <Link
                  to="/app/alerts"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition"
                >
                  Acompanhar no Mapa
                </Link>
                <button
                  onClick={handleResolveAlert}
                  disabled={activatingAlert}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm px-5 py-3 rounded-xl border border-gray-200 transition shadow-sm"
                >
                  {activatingAlert ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Marcar como Encontrado'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="text-lg font-black text-gray-900 mb-5 pb-3 border-b border-gray-100">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Raça', value: pet.breed },
                { label: 'Cor', value: pet.color },
                { label: 'Peso', value: pet.weight ? `${pet.weight} kg` : null },
                { label: 'Microchip', value: pet.microchip },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-semibold text-gray-800">{value || '—'}</p>
                </div>
              ))}
            </div>

            {pet.features && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Características Físicas (Usadas pela IA)
                </p>
                <div className="bg-cream-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {pet.features}
                </div>
              </div>
            )}
          </div>

          {/* Vaccines card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Syringe size={18} className="text-brand-500" />
                Carteira de Vacinação
              </h3>
              <button
                onClick={() => setShowVaccineModal(true)}
                className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-sm px-3 py-2 rounded-xl border border-brand-100 transition"
              >
                <Plus size={14} />
                Adicionar Vacina
              </button>
            </div>

            {vaccines.length === 0 ? (
              <div className="text-center py-8">
                <Syringe size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhuma vacina registrada</p>
                <button
                  onClick={() => setShowVaccineModal(true)}
                  className="mt-3 text-brand-500 hover:text-brand-600 text-sm font-semibold transition"
                >
                  + Adicionar primeira vacina
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccines.map((vaccine) => {
                  const { label, color, icon: StatusIcon } = getVaccineStatus(vaccine);
                  return (
                    <div
                      key={vaccine.id}
                      className="flex items-center gap-4 p-4 bg-cream-100 rounded-xl border border-cream-200"
                    >
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-100">
                        <Syringe size={18} className="text-brand-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{vaccine.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Aplicada em {new Date(vaccine.date_given).toLocaleDateString('pt-BR')}
                          {vaccine.veterinarian && ` • Dr(a). ${vaccine.veterinarian}`}
                        </p>
                        {vaccine.next_due && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Próxima: {new Date(vaccine.next_due).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${color}`}>
                        <StatusIcon size={11} />
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vaccine Modal */}
      {showVaccineModal && (
        <VaccineModal
          petId={pet.id}
          onClose={() => setShowVaccineModal(false)}
          onSuccess={fetchVaccines}
        />
      )}
    </div>
  );
};
