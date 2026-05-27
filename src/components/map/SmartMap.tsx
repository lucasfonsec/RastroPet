import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Camera, LostAlert } from '../../types';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (e.g. São Paulo)
const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308
};

interface SmartMapProps {
  cameras: Camera[];
  alerts: LostAlert[];
}

export const SmartMap: React.FC<SmartMapProps> = ({ cameras, alerts }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // Placeholder para a chave
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedItem, setSelectedItem] = useState<Camera | LostAlert | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    
    // Fit bounds se existirem câmeras ou alertas
    if (cameras.length > 0 || alerts.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      cameras.forEach(cam => bounds.extend({ lat: cam.latitude, lng: cam.longitude }));
      alerts.forEach(alert => {
        if (alert.latitude && alert.longitude) {
          bounds.extend({ lat: alert.latitude, lng: alert.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [cameras, alerts]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Verifica se o item é uma câmera ou um alerta para renderizar o InfoWindow
  const isCamera = (item: any): item is Camera => 'admin_id' in item;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={cameras.length > 0 ? { lat: cameras[0].latitude, lng: cameras[0].longitude } : defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
          }
        ] // Limpa um pouco o mapa
      }}
    >
      {/* Markers para Câmeras */}
      {cameras.map(camera => (
        <Marker
          key={`cam-${camera.id}`}
          position={{ lat: camera.latitude, lng: camera.longitude }}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#059669" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>'),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          }}
          onClick={() => setSelectedItem(camera)}
        />
      ))}

      {/* Markers para Pets Perdidos */}
      {alerts.map(alert => {
        if (!alert.latitude || !alert.longitude) return null;
        return (
          <Marker
            key={`alert-${alert.id}`}
            position={{ lat: alert.latitude, lng: alert.longitude }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#DC2626" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40),
            }}
            onClick={() => setSelectedItem(alert)}
            animation={window.google.maps.Animation.DROP}
          />
        )
      })}

      {/* InfoWindow ao clicar no marcador */}
      {selectedItem && (
        <InfoWindow
          position={
            isCamera(selectedItem)
              ? { lat: selectedItem.latitude, lng: selectedItem.longitude }
              : { lat: selectedItem.latitude!, lng: selectedItem.longitude! }
          }
          onCloseClick={() => setSelectedItem(null)}
        >
          <div className="p-2 min-w-[200px]">
            {isCamera(selectedItem) ? (
              <>
                <h3 className="font-bold text-gray-900 mb-1">Câmera de Vigilância</h3>
                <p className="text-sm text-gray-700">{selectedItem.name}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedItem.street}, {selectedItem.number || 'S/N'}</p>
                <div className="mt-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded inline-block">Online</div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-red-600 mb-1">Alerta de IA: Pet Visto!</h3>
                <p className="text-sm text-gray-700 line-clamp-2">{selectedItem.description}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">Localização detectada por visão computacional.</p>
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};
