import type { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { MapMarker } from '../../types/smartSavings';
import { formatINR } from '../../services/smartSavingsApi';
import 'leaflet/dist/leaflet.css';

const makeIcon = (color: string, label: string) => L.divIcon({
  className: '',
  html: `<div style="background:${color};color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${label}</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15],
});

interface Props { mapData: { center: { lat: number; lng: number }; zoom: number; markers: MapMarker[] } }

const SavingsMap: FC<Props> = ({ mapData }) => {
  const user = mapData.markers.find(m => m.type === 'user_city');
  const others = mapData.markers.filter(m => m.type === 'savings_city');
  if (!user?.lat || !user?.lng) return null;

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">🗺️ Savings Map</h3>
      </div>
      <MapContainer center={[mapData.center.lat, mapData.center.lng]} zoom={mapData.zoom} style={{ height: 380, zIndex: 0 }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
        <Marker position={[user.lat, user.lng]} icon={makeIcon('#DC2626', '📍')}>
          <Popup><b>{user.name}</b><br />{user.hospital}<br /><span className="text-orange-600 font-bold">{formatINR(user.price)}</span></Popup>
        </Marker>
        {others.map(m => m.lat && m.lng && (
          <div key={m.name}>
            <Marker position={[m.lat, m.lng]} icon={makeIcon('#16A34A', String(m.rank || '✓'))}>
              <Popup><b>#{m.rank} {m.name}</b><br />{m.hospital}<br />Total: <b>{formatINR(m.total_cost!)}</b><br /><span className="text-green-600 font-bold">Save {formatINR(m.savings!)} ({m.savings_pct}%)</span></Popup>
            </Marker>
            <Polyline positions={[[user.lat!, user.lng!], [m.lat, m.lng]]} pathOptions={{ color: '#16A34A', weight: 2, dashArray: '8 4', opacity: 0.6 }} />
          </div>
        ))}
      </MapContainer>
    </div>
  );
};

export default SavingsMap;
