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
  dateFilter: string;
}

export default function EventsSidebar({
  events,
  isLoading,
  searchQuery,
  onSearchChange,
  onFilterChange,
  onEventClick,
  selectedCategory,
  dateFilter
}: EventsSidebarProps) {
  const [delayedSearchQuery, setDelayedSearchQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(delayedSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [delayedSearchQuery, onSearchChange]);

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

  const dateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'This weekend', value: 'weekend' },
    { label: 'Next week', value: 'next-week' },
    { label: 'Custom...', value: 'custom' }
  ];

  return (
    <aside className="events-container w-full md:w-2/5 lg:w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Search and filter bar */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search events or locations"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003F8C] focus:border-transparent"
            value={delayedSearchQuery}
            onChange={(e) => setDelayedSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className={selectedCategory === category.value 
                ? "bg-[#003F8C] text-white text-sm px-3 py-1 rounded-full whitespace-nowrap"
                : "bg-[#F5F5F5] text-[#333333] text-sm px-3 py-1 rounded-full whitespace-nowrap hover:bg-gray-200"
              }
              onClick={() => onFilterChange({ category: category.value, date: dateFilter })}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2 mt-2">
          <Select 
            value={dateFilter} 
            onValueChange={(value) => onFilterChange({ category: selectedCategory, date: value })}
          >
            <SelectTrigger className="bg-white border border-gray-300 rounded-md text-sm px-2 py-1 h-9 focus:outline-none focus:ring-1 focus:ring-[#003F8C]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center space-x-1 border border-gray-300 rounded-md text-sm px-2 py-1 h-9 hover:bg-[#F5F5F5]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
            <span>Filters</span>
          </Button>
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
