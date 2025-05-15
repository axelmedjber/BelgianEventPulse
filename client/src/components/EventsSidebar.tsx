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
  onEventClick: (event: Event) => void;
}

export default function EventsSidebar({
  events,
  isLoading,
  onEventClick
}: EventsSidebarProps) {

  // No date options as we're only showing today's events

  return (
    <aside className="events-container w-full md:w-2/5 lg:w-1/3 bg-background border-r border-border flex flex-col">
      {/* Search and filter bar */}
      <div className="sticky top-0 bg-background z-10 p-4 border-b border-border">
        <h2 className="font-medium text-lg text-primary">Belgium Events</h2>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, index) => (
            <div key={index} className="p-4 border-b border-border">
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
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
