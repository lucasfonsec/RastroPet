import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, AlertCircle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    onlineCameras: 0,
    totalVideos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { count: alertsCount } = await supabase
        .from('lost_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: camerasCount } = await supabase
        .from('cameras')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'online');

      setStats({
        activeAlerts: alertsCount || 0,
        onlineCameras: camerasCount || 0,
        totalVideos: 0, // Placeholder
      });
    } catch (error) {
      console.error('Error fetching stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Alertas Ativos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <Camera size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Câmeras Online</p>
            <p className="text-2xl font-bold text-gray-900">{stats.onlineCameras}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Processamento IA</p>
            <p className="text-2xl font-bold text-gray-900">Estável</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/cameras" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center">
            <Camera className="text-brand-600 mr-4" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Gerenciar Câmeras</h3>
              <p className="text-sm text-gray-500">Adicione ou edite câmeras na rede de vigilância.</p>
            </div>
          </Link>
          
          <Link to="/admin/alerts" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center">
            <AlertCircle className="text-brand-600 mr-4" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Monitorar Alertas</h3>
              <p className="text-sm text-gray-500">Veja o mapa em tempo real e resultados da IA.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
