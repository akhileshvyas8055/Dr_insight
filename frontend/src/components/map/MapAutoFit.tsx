import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props { userLat: number; userLng: number; hospitals: Array<{ latitude: number; longitude: number }>; }

export default function MapAutoFit({ userLat, userLng, hospitals }: Props) {
  const map = useMap();
  useEffect(() => {
    const points: L.LatLngExpression[] = [[userLat, userLng]];
    hospitals.slice(0, 5).forEach(h => {
      if (h.latitude && h.longitude) points.push([h.latitude, h.longitude]);
    });
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([userLat, userLng], 13);
    }
  }, [userLat, userLng, hospitals, map]);
  return null;
}
