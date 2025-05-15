import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EventCard from './EventCard';
import { Event, EventCategory, EventFilter } from '@/lib/types';

interface EventsSidebarProps {
  events: Event[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: EventFilter) => void;
  onEventClick: (event: Event) => void;
  selectedCategory: EventCategory | 'all';
}

export default function EventsSidebar({
  events,
  isLoading,
  searchQuery,
  onSearchChange,
  onFilterChange,
  onEventClick,
  selectedCategory
}: EventsSidebarProps) {

  const categories: { label: string; value: EventCategory | 'all' }[] = [
    { label: 'All Events', value: 'all' },
    { label: 'Music', value: 'music' },
    { label: 'Art', value: 'art' },
    { label: 'Food', value: 'food' },
    { label: 'Sports', value: 'sports' },
    { label: 'Nightlife', value: 'nightlife' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Theater', value: 'theater' }
  ];

  // No date options as we're only showing today's events

  return (
    <aside className="events-container w-full md:w-2/5 lg:w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Search and filter bar */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">

        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className={selectedCategory === category.value 
                ? "bg-[#003F8C] text-white text-sm px-3 py-1 rounded-full whitespace-nowrap"
                : "bg-[#F5F5F5] text-[#333333] text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-gray-200"
              }
              onClick={() => onFilterChange({ category: category.value })}
            >
              {category.label}
            </Button>
          ))}
        </div>
        

      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200">
              <div className="flex">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </div>
              </div>
            </div>
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => onEventClick(event)} 
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
