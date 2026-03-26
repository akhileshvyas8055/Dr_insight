import { Polyline, Popup } from 'react-leaflet';
import type { FC } from 'react';
import type { RouteDetails } from '../../types/nearbyHospitals';

interface Props { route: RouteDetails; hospitalName: string; }

const RoutePolyline: FC<Props> = ({ route, hospitalName }) => {
  if (!route.route_geometry.length) return null;
  return (
    <>
      <Polyline positions={route.route_geometry as [number, number][]} pathOptions={{ color: '#000', weight: 7, opacity: 0.3 }} />
      <Polyline positions={route.route_geometry as [number, number][]} pathOptions={{ color: '#10B981', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}>
        <Popup><div className="text-sm"><strong>Route to {hospitalName}</strong><br />📏 {route.total_distance_display}<br />⏱️ {route.total_duration_display}</div></Popup>
      </Polyline>
    </>
  );
};

export default RoutePolyline;
