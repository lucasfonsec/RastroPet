import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, LostAlert } from '../../types';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Default center: São Paulo
const DEFAULT_CENTER: [number, number] = [-23.55052, -46.633308];
const DEFAULT_ZOOM = 12;

// Custom SVG icons
const cameraIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#059669;
    border:2px solid white;
    border-radius:50%;
    width:34px;
    height:34px;
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const alertIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#DC2626;
    border:2px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    width:36px;
    height:36px;
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      style="transform:rotate(45deg)">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [10, 34],
  popupAnchor: [8, -30],
});

// Helper: auto-fit map bounds when markers change
function FitBounds({ cameras, alerts }: { cameras: Camera[]; alerts: LostAlert[] }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      ...cameras.map(c => [c.latitude, c.longitude] as [number, number]),
      ...alerts
        .filter(a => a.latitude && a.longitude)
        .map(a => [a.latitude!, a.longitude!] as [number, number]),
    ];

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    }
  }, [cameras, alerts, map]);

  return null;
}

interface SmartMapProps {
  cameras: Camera[];
  alerts: (LostAlert & { video_url?: string })[];
}

export const SmartMap: React.FC<SmartMapProps> = ({ cameras, alerts }) => {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds cameras={cameras} alerts={alerts} />

      {/* Câmeras */}
      {cameras.map(camera => (
        <Marker
          key={`cam-${camera.id}`}
          position={[camera.latitude, camera.longitude]}
          icon={cameraIcon}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Câmera de Vigilância</h3>
              <p style={{ fontSize: 14, color: '#374151' }}>{camera.name}</p>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                {camera.street}, {camera.number || 'S/N'}
              </p>
              <span style={{
                display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 600,
                background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 9999
              }}>
                Online
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Pets perdidos */}
      {alerts.map(alert => {
        if (!alert.latitude || !alert.longitude) return null;
        return (
          <Marker
            key={`alert-${alert.id}`}
            position={[alert.latitude, alert.longitude]}
            icon={alertIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h3 style={{ fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>
                  Alerta de IA: Pet Visto!
                </h3>
                <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{alert.description}</p>
                
                {alert.video_url && (
                  <div style={{ marginTop: 8, marginBottom: 8, borderRadius: 8, overflow: 'hidden' }}>
                    <video 
                      src={alert.video_url} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      style={{ width: '100%', height: 'auto', display: 'block' }} 
                    />
                  </div>
                )}

                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                  Localização detectada por visão computacional.
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
