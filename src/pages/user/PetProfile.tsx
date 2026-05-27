import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Pet } from '../../types';
import { PawPrint, AlertTriangle, ArrowLeft, Edit3, Trash2 } from 'lucide-react';

export const PetProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingAlert, setActivatingAlert] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPet();
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

  const handleActivateAlert = async () => {
    if (!pet) return;
    
    // Confirmação com o usuário
    const confirm = window.confirm(
      "TEM CERTEZA QUE DESEJA EMITIR UM ALERTA DE PERDIDO?\n\nIsso acionará a inteligência artificial para procurar seu pet em todas as câmeras de segurança da rede."
    );
    
    if (!confirm) return;

    setActivatingAlert(true);

    try {
      // 1. Muda o status do pet
      const { error: updateError } = await supabase
        .from('pets')
        .update({ status: 'lost' })
        .eq('id', pet.id);

      if (updateError) throw updateError;

      // 2. Cria o registro de Alerta
      const { error: alertError } = await supabase
        .from('lost_alerts')
        .insert([{
          pet_id: pet.id,
          user_id: pet.user_id,
          description: `Buscando por ${pet.name}. ${pet.features || ''}`,
          status: 'active'
        }]);

      if (alertError) throw alertError;

      // Sucesso!
      setPet({ ...pet, status: 'lost' });
      alert("Alerta ativado com sucesso! A Inteligência Artificial já começou as buscas nas câmeras de segurança.");

    } catch (error) {
      console.error("Erro ao ativar alerta:", error);
      alert("Houve um erro ao ativar o alerta.");
    } finally {
      setActivatingAlert(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/app/pets" className="mr-4 text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Perfil do Pet</h1>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-500 hover:text-brand-600 bg-white rounded-lg border border-gray-200 transition shadow-sm">
            <Edit3 size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-red-600 bg-white rounded-lg border border-gray-200 transition shadow-sm">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Foto e Alerta */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-64 bg-gray-100 flex items-center justify-center relative">
               {pet.status === 'lost' && (
                  <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center font-bold py-2 uppercase tracking-wider text-sm animate-pulse z-10">
                    Alerta de Perdido Ativo
                  </div>
                )}
              {pet.image_url ? (
                <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={64} className="text-gray-300" />
              )}
            </div>
            <div className="p-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
              <p className="text-gray-500 capitalize">{pet.species}</p>
            </div>
          </div>

          {/* O BOTÃO MÁGICO */}
          {pet.status === 'safe' ? (
            <button
              onClick={handleActivateAlert}
              disabled={activatingAlert}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition flex flex-col items-center justify-center space-y-2 group"
            >
              <AlertTriangle size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-lg">ACIONAR ALERTA DE PERDIDO</span>
              <span className="text-xs font-normal text-red-100">Inicia a busca por IA nas câmeras</span>
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-600 animate-pulse" />
              </div>
              <h3 className="text-red-800 font-bold text-lg mb-2">Busca em Andamento</h3>
              <p className="text-sm text-red-600 mb-4">A inteligência artificial está analisando imagens de câmeras de segurança.</p>
              <Link to="/app/alerts" className="text-red-700 font-bold underline text-sm hover:text-red-800">
                Acompanhar no Mapa
              </Link>
            </div>
          )}
        </div>

        {/* Coluna de Informações */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Raça</p>
                <p className="font-medium text-gray-900">{pet.breed || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cor</p>
                <p className="font-medium text-gray-900">{pet.color || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Peso</p>
                <p className="font-medium text-gray-900">{pet.weight ? `${pet.weight} kg` : 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Microchip</p>
                <p className="font-medium text-gray-900">{pet.microchip || 'Não informado'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-1">Características Físicas (Usado pela IA)</p>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm">
                {pet.features || 'Nenhuma característica marcante registrada.'}
              </div>
            </div>
          </div>

          {/* Placeholder para Histórico Médico / Vacinas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">Carteira de Vacinação</h3>
              <button className="text-brand-600 text-sm font-medium hover:underline">Adicionar Vacina</button>
            </div>
            <div className="text-center py-6 text-gray-500">
              <p>Nenhuma vacina registrada.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
