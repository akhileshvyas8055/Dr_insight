import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { FC } from 'react';

interface Props { lat: number; lng: number; accuracy?: number; radiusKm: number; }

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;top:0;left:0;width:24px;height:24px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.8);z-index:2;"></div>
      <div style="position:absolute;top:-8px;left:-8px;width:40px;height:40px;background:rgba(59,130,246,0.25);border-radius:50%;animation:pulse-ring 2s ease-out infinite;z-index:1;"></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

const UserLocationMarker: FC<Props> = ({ lat, lng, accuracy, radiusKm }) => (
  <>
    <Marker position={[lat, lng]} icon={userIcon}>
      <Popup><div className="text-sm"><strong>📍 Your Location</strong><br />{accuracy && <span className="text-gray-500">Accuracy: ±{Math.round(accuracy)}m</span>}</div></Popup>
    </Marker>
    <Circle center={[lat, lng]} radius={radiusKm * 1000} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' }} />
  </>
);

export default UserLocationMarker;
