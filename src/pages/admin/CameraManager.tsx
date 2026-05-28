import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Camera as CameraType } from '../../types';
import { Plus, Camera, MapPin, Loader2, Upload, Video, Trash2 } from 'lucide-react';

export const CameraManager: React.FC = () => {
  const { profile } = useAuthStore();
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCameras(data || []);
    } catch (error) {
      console.error('Error fetching cameras', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);

    try {
      let lat = -23.55052; // Default SP
      let lon = -46.633308;

      try {
        const addressQuery = `${formData.street}, ${formData.number ? formData.number + ', ' : ''}${formData.city}, ${formData.state}`;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
        } else {
          alert("Aviso: Não foi possível localizar as coordenadas exatas deste endereço. Usando coordenadas da região central para exibição no mapa.");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }

      const { error } = await supabase.from('cameras').insert([
        {
          admin_id: profile.id,
          name: formData.name,
          street: formData.street,
          number: formData.number || null,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          latitude: lat,
          longitude: lon,
          status: 'online',
        },
      ]);

      if (error) throw error;
      
      // Reset form and refresh
      setShowForm(false);
      setFormData({
        name: '', street: '', number: '', neighborhood: '', city: '', state: ''
      });
      fetchCameras();
    } catch (error) {
      console.error('Error saving camera', error);
      alert('Erro ao salvar câmera. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCamera = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta câmera? Todos os vídeos vinculados a ela poderão ser afetados.')) return;
    try {
      const { error } = await supabase.from('cameras').delete().eq('id', id);
      if (error) throw error;
      fetchCameras();
    } catch (err) {
      console.error('Error deleting camera', err);
      alert('Erro ao excluir câmera. Tente novamente.');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, camera_id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${camera_id}_${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // 1. Upload pro Storage
      const { error: uploadError } = await supabase.storage
        .from('cameras_videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Erro no armazenamento: ${uploadError.message}`);
      }

      // Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cameras_videos')
        .getPublicUrl(filePath);

      // 2. Salvar no banco
      const { error: dbError } = await supabase.from('camera_videos').insert([
        {
          camera_id: camera_id,
          video_url: publicUrl,
          recorded_at: new Date().toISOString(),
          analyzed: false
        }
      ]);

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Erro ao registrar vídeo: ${dbError.message}`);
      }

      alert('✅ Vídeo carregado com sucesso! A IA será acionada em breve.');
      setSelectedCamera(null);
    } catch (error: any) {
      console.error('Erro no upload de vídeo:', error);
      alert(`Erro no envio: ${error.message || 'Verifique se o bucket cameras_videos está configurado no Supabase Storage com permissões de upload.'}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Câmeras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nova Câmera
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Adicionar Nova Câmera</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Identificação / Nome *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" placeholder="Câmera Posto Ipiranga Centro" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                <input type="text" name="street" required value={formData.street} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input type="text" name="number" value={formData.number} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input type="text" name="neighborhood" required value={formData.neighborhood} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF) *</label>
                <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full border-gray-300 rounded-md border p-2" placeholder="SP" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md mr-3 hover:bg-gray-200">Cancelar</button>
              <button type="submit" disabled={submitting} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-md font-medium flex items-center">
                {submitting && <Loader2 className="animate-spin mr-2" size={18} />}
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câmera</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cameras.map((camera) => (
                <tr key={camera.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Camera size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{camera.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin size={12} className="mr-1" /> lat: {camera.latitude.toFixed(4)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{camera.street}, {camera.number || 'S/N'}</div>
                    <div className="text-sm text-gray-500">{camera.neighborhood} - {camera.city}/{camera.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${camera.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {camera.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-4">
                      <button 
                        onClick={() => setSelectedCamera(camera)}
                        className="text-brand-600 hover:text-brand-900 flex items-center"
                      >
                        <Video size={16} className="mr-1" />
                        Enviar Vídeo
                      </button>
                      <button 
                        onClick={() => handleDeleteCamera(camera.id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        title="Excluir Câmera"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cameras.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma câmera cadastrada na rede.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Video Modal */}
      {selectedCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Enviar Gravação - {selectedCamera.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Faça o upload de um vídeo curto (MP4) para simular uma gravação real desta câmera. 
              A IA analisará este vídeo para buscar pets perdidos na rede.
            </p>
            
            <div className="flex items-center justify-center w-full mb-6">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-brand-50 hover:bg-brand-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingVideo ? (
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-brand-500 mb-2" />
                  )}
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para enviar</span>
                  </p>
                  <p className="text-xs text-gray-500">MP4, WebM ou AVI</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  disabled={uploadingVideo}
                  onChange={(e) => handleVideoUpload(e, selectedCamera.id)}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedCamera(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                disabled={uploadingVideo}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
