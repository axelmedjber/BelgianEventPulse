import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Plus, Minus, Navigation, Layers } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MapViewProps {
  events: Event[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (event: Event) => void;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
}

export default function MapView({ 
  events, 
  center, 
  zoom, 
  onMarkerClick, 
  onCenterChange, 
  onZoomChange 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{[key: string]: mapboxgl.Marker}>({});
  const { theme } = useTheme();
  const [mapStyle, setMapStyle] = useState(
    theme === 'dark' 
      ? 'mapbox://styles/mapbox/navigation-night-v1' 
      : 'mapbox://styles/mapbox/streets-v12'
  );

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center,
        zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');

      // Track map movements
      map.current.on('move', () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        onCenterChange([center.lng, center.lat]);
        onZoomChange(map.current.getZoom());
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style when it changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);
  
  // Update map style when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      setMapStyle('mapbox://styles/mapbox/navigation-night-v1');
    } else {
      setMapStyle('mapbox://styles/mapbox/streets-v12');
    }
  }, [theme]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current) {
      map.current.setCenter(center);
      map.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Add or update markers when events change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    events.forEach(event => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.style.backgroundColor = event.featured ? 
        (theme === 'dark' ? '#ff4759' : '#E41E31') : 
        (theme === 'dark' ? '#2563eb' : '#003F8C');
      markerEl.style.border = `2px solid ${theme === 'dark' ? '#333' : 'white'}`;
      markerEl.style.boxShadow = theme === 'dark' ? 
        '0 2px 4px rgba(255,255,255,0.2)' : 
        '0 2px 4px rgba(0,0,0,0.3)';
      
      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([event.longitude, event.latitude])
        .addTo(map.current!);
      
      // Add click handler
      markerEl.addEventListener('click', () => {
        onMarkerClick(event);
      });
      
      // Store marker reference
      markersRef.current[event.id] = marker;
    });
  }, [events, onMarkerClick, theme]);

  // Handle map style change
  const handleMapStyleChange = (style: string) => {
    switch (style) {
      case 'standard':
        setMapStyle(theme === 'dark' 
          ? 'mapbox://styles/mapbox/dark-v11' 
          : 'mapbox://styles/mapbox/streets-v12');
        break;
      case 'satellite':
        setMapStyle('mapbox://styles/mapbox/satellite-streets-v12');
        break;
      case 'transit':
        setMapStyle(theme === 'dark'
          ? 'mapbox://styles/mapbox/navigation-night-v1'
          : 'mapbox://styles/mapbox/navigation-day-v1');
        break;
      default:
        setMapStyle(theme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/streets-v12');
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  // Handle user location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <main className="map-container relative w-full md:w-3/5 lg:w-2/3 h-64 md:h-full">
      <div ref={mapContainer} className="map-area h-full w-full relative" />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-background rounded-md shadow-md">
        <Button 
          variant="ghost" 
          className="p-2 hover:bg-muted border-b border-border block w-full rounded-none rounded-t-md" 
          onClick={handleZoomIn}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          className="p-2 hover:bg-muted block w-full rounded-none rounded-b-md" 
          onClick={handleZoomOut}
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>

      {/* Map style selector */}
      <div className="absolute top-4 left-4 bg-background rounded-md shadow-md p-2">
        <Select onValueChange={handleMapStyleChange} defaultValue={theme === 'dark' ? 'transit' : 'standard'}>
          <SelectTrigger className="w-24 text-sm focus:outline-none h-8 border-0">
            <SelectValue placeholder="Map Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="transit">Transit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location button */}
      <Button
        variant="outline"
        className="absolute bottom-24 right-4 bg-background p-3 rounded-full shadow-md hover:bg-muted h-10 w-10"
        onClick={handleGetUserLocation}
      >
        <Navigation className="h-5 w-5 text-primary" />
      </Button>

      {/* Map legend - on mobile only */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 bg-background rounded-md shadow-md p-3">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-xs">Regular Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
            <span className="text-xs">Featured Events</span>
          </div>
        </div>
      </div>
    </main>
  );
}
