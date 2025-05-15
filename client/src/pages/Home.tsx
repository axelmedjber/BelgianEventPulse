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
  // State for search query and selected category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  
  // State for map center and zoom
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.3517, 50.8503]); // Brussels coordinates
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Fetch events from the API
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', selectedCategory],
  });

  // Apply filters to events - only filter by category and search
  // (we're already filtering by today's date on the server)
  const filteredEvents = events.filter(event => {
    // Filter by search query
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle filter changes - now only for category
  const handleFilterChange = (filter: EventFilter) => {
    setSelectedCategory(filter.category || 'all');
  };

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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterChange={handleFilterChange}
          onEventClick={handleEventCardClick}
          selectedCategory={selectedCategory}
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
