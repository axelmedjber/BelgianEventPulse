import { useState } from 'react';
import Header from '@/components/Header';
import EventsSidebar from '@/components/EventsSidebar';
import MapView from '@/components/MapView';
import { Event, EventCategory, EventFilter, BelgianCity } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface HomeProps {
  onEventSelect: (event: Event) => void;
}

export default function Home({ onEventSelect }: HomeProps) {
  // State for map center and zoom
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.3517, 50.8503]); // Brussels coordinates
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [selectedCity, setSelectedCity] = useState<BelgianCity>('All');

  // Belgian city coordinates
  const cityCoordinates: Record<BelgianCity, [number, number]> = {
    'Brussels': [4.3517, 50.8503],
    'Antwerp': [4.4024, 51.2194],
    'Ghent': [3.7250, 51.0543],
    'Bruges': [3.2247, 51.2093],
    'Leuven': [4.7005, 50.8798],
    'Liège': [5.5718, 50.6326],
    'Namur': [4.8652, 50.4673],
    'Charleroi': [4.4446, 50.4108],
    'Mons': [3.9668, 50.4542],
    'Ostend': [2.9187, 51.2246],
    'All': [4.6667, 50.6333], // Center of Belgium
  };

  // Fetch events from the API
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Handle city change
  const handleCityChange = (city: string) => {
    const belgianCity = city as BelgianCity;
    setSelectedCity(belgianCity);
    
    // Update map center based on selected city
    setMapCenter(cityCoordinates[belgianCity]);
    
    // Adjust zoom level
    setMapZoom(belgianCity === 'All' ? 8 : 12);
  };

  // Filter events by city
  const filteredEvents = events.filter(event => {
    if (selectedCity === 'All') return true;
    
    // If the event has a city property, use that
    if (event.city) {
      return event.city === selectedCity;
    }
    
    // Otherwise try to determine city from location string
    const locationLower = event.location.toLowerCase();
    return locationLower.includes(selectedCity.toLowerCase());
  });

  // Handle map marker click
  const handleMarkerClick = (event: Event) => {
    onEventSelect(event);
  };

  // Handle event card click
  const handleEventCardClick = (event: Event) => {
    // Center map on event location
    setMapCenter([event.longitude, event.latitude]);
    setMapZoom(14);
    onEventSelect(event);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-60px)]">
        <EventsSidebar
          events={filteredEvents}
          isLoading={isLoading}
          onEventClick={handleEventCardClick}
        />
        
        <MapView
          events={filteredEvents}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerClick={handleMarkerClick}
          onCenterChange={setMapCenter}
          onZoomChange={setMapZoom}
        />
      </div>
    </div>
  );
}
