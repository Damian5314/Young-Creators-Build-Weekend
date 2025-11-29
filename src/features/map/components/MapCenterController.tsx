import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterControllerProps {
  center: [number, number];
}

export function MapCenterController({ center }: MapCenterControllerProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}
