import { formatDistanceToNow } from 'date-fns';
import { Event } from '@/lib/types';
import { Calendar } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const getCategoryColor = (category: string) => {
    return 'bg-[#FAE042] text-[#333333]'; // All categories use Belgian yellow as background
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString([], { weekday: 'long' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const distanceFromUser = event.distance ? `${event.distance.toFixed(1)} km` : '';

  return (
    <div className="event-card p-4 border-b border-border hover:bg-muted/50 cursor-pointer" onClick={onClick}>
      <div className="flex">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <span className={`inline-block px-2 py-1 ${getCategoryColor(event.category)} text-xs font-semibold rounded`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            {distanceFromUser && <span className="text-sm text-muted-foreground">{distanceFromUser}</span>}
          </div>
          <h3 className="font-roboto font-medium text-lg mt-1 line-clamp-1">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {event.location}
            {event.city && event.city !== 'All' && <span className="ml-1">• {event.city}</span>}
          </p>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(new Date(event.date))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
