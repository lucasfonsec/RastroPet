import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, LostAlert } from '../../types';
import { SmartMap } from '../../components/map/SmartMap';
import { AlertTriangle, Map, ScanEye, CheckCircle2 } from 'lucide-react';

export const AdminAlerts: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<LostAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cameras
      const { data: cams } = await supabase.from('cameras').select('*');
      if (cams) setCameras(cams);

      // Fetch active alerts
      const { data: activeAlerts } = await supabase
        .from('lost_alerts')
        .select('*')
        .eq('status', 'active');
      
      if (activeAlerts) setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error fetching data for map', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAIDetection = async () => {
    if (alerts.length === 0 || cameras.length === 0) {
      alert("Para testar a IA, você precisa ter pelo menos 1 câmera cadastrada e 1 pet com status 'PERDIDO'.");
      return;
    }

    const confirm = window.confirm("SIMULAÇÃO IA: Deseja simular que a inteligência artificial encontrou o primeiro pet perdido da fila em uma câmera aleatória?");
    if (!confirm) return;

    const alertToUpdate = alerts[0];
    const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];

    // Atualiza a latitude e longitude do alerta para bater com a da câmera (ou próximo dela)
    // Na vida real, a IA criaria um registro em 'ai_matches' e nós faríamos join
    try {
      const { error } = await supabase
        .from('lost_alerts')
        .update({ 
          latitude: randomCamera.latitude + 0.0001, // Ligeiramente ao lado para não sobrepor o pino exatamente
          longitude: randomCamera.longitude + 0.0001 
        })
        .eq('id', alertToUpdate.id);

      if (error) throw error;
      
      alert(`BINGO! A IA detectou o pet do alerta na câmera "${randomCamera.name}"! O mapa foi atualizado.`);
      fetchData(); // Recarrega os dados do mapa
    } catch (error) {
      console.error(error);
      alert("Erro ao simular IA.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Map className="mr-2" /> Central de Monitoramento
        </h1>
        <div className="flex space-x-3">
          <button 
            onClick={fetchData}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Atualizar Mapa
          </button>
          <button 
            onClick={simulateAIDetection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-md animate-pulse"
          >
            <ScanEye size={18} className="mr-2" />
            Simular Detecção IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Painel lateral de Alertas */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={20} />
              Alertas Ativos ({alerts.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-4">Carregando...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-500">Nenhum pet perdido no momento.</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${alert.latitude ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded">Buscando</span>
                    <span className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{alert.description}</p>
                  
                  {alert.latitude ? (
                    <p className="text-xs text-red-700 font-bold mt-2 flex items-center">
                      <ScanEye size={14} className="mr-1" /> Visto pela IA recentemente!
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">Aguardando detecção nas câmeras...</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-3 bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
          <SmartMap cameras={cameras} alerts={alerts} />
          
          {/* Instrução flutuante */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md border border-gray-200 max-w-sm pointer-events-none">
            <h3 className="font-bold text-gray-900 text-sm flex items-center">
              <Map className="mr-1 h-4 w-4" /> Mapa de Ocorrências
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Os ícones verdes representam as câmeras da rede. Os ícones vermelhos aparecerão quando a IA detectar um pet procurado nas proximidades de uma câmera.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
