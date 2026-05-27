import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, LostAlert } from '../../types';
import { SmartMap } from '../../components/map/SmartMap';
import { useAuthStore } from '../../store/useAuthStore';
import { Map, AlertCircle } from 'lucide-react';

export const UserAlerts: React.FC = () => {
  const { user } = useAuthStore();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<LostAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // O usuário pode ver as câmeras (para saber a rede de cobertura)
      const { data: cams } = await supabase.from('cameras').select('*');
      if (cams) setCameras(cams);

      // Busca os alertas apenas deste usuário
      const { data: userAlerts } = await supabase
        .from('lost_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (userAlerts) setAlerts(userAlerts);
    } catch (error) {
      console.error('Error fetching alerts', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Map className="mr-2" /> Acompanhar Buscas
        </h1>
        <p className="text-gray-600 mt-1">Veja a localização dos seus pets perdidos identificados pela rede de vigilância RastroPet.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet perdido no momento</h3>
          <p className="text-gray-500">Seus pets estão seguros. Caso algum se perca, você poderá acionar o alerta no perfil do pet.</p>
        </div>
      ) : (
        <div className="bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-1 relative">
          <SmartMap cameras={cameras} alerts={alerts} />
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <h3 className="font-bold text-brand-600 mb-2 border-b pb-2">Últimas Detecções (IA)</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {alerts.filter(a => a.latitude).map(alert => (
                <div key={alert.id} className="bg-red-50 p-2 rounded border border-red-100">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{alert.description}</p>
                  <p className="text-xs text-red-600 font-bold mt-1">Visto no mapa!</p>
                </div>
              ))}
              {alerts.filter(a => !a.latitude).length > 0 && (
                <p className="text-xs text-gray-500 italic mt-2">
                  Existem pets perdidos ainda não localizados pelas câmeras. A IA continua buscando.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
