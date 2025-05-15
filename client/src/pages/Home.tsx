import { useState } from 'react';
import Header from '@/components/Header';
import EventsSidebar from '@/components/EventsSidebar';
import MapView from '@/components/MapView';
import { Event, EventCategory, EventFilter } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface HomeProps {
  onEventSelect: (event: Event) => void;
}

export default function Home({ onEventSelect }: HomeProps) {
  // State for map center and zoom
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.3517, 50.8503]); // Brussels coordinates
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Fetch events from the API
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // No filtering - show all events
  const filteredEvents = events;

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
