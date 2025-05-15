import { Event } from '../../../shared/schema';
import { ApiClient } from '../utils/api-client';
import { ApiConfig } from '../utils/config';
import { EventAdapter } from '../utils/event-adapter';
import { log } from '../../vite';

// Facebook Graph API client for events
const FB_API_VERSION = 'v18.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

/**
 * Facebook Events API provider
 */
export const facebook = {
  /**
   * Fetches events from Facebook Graph API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    const apiKey = ApiConfig.getFacebookApiKey();
    if (!apiKey) {
      log('Facebook API key not available, skipping...', 'facebook-api');
      return [];
    }
    
    try {
      // Create API client
      const client = new ApiClient(FB_BASE_URL, {
        'Authorization': `Bearer ${apiKey}`
      });
      
      // Get Brussels coordinates for searching nearby
      const { lat, lng, radius } = ApiConfig.getBrusselsCoordinates();
      
      // Get date range (today to 7 days from now)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Format dates for Facebook API
      const since = Math.floor(today.getTime() / 1000);
      const until = Math.floor(nextWeek.getTime() / 1000);
      
      // Fetch events in Brussels area
      const response = await client.get<FacebookEventsResponse>('/events/search', {
        params: {
          'center': `${lat},${lng}`,
          'distance': radius * 1000, // Convert to meters
          'time_filter': 'upcoming',
          'since': since,
          'until': until,
          'fields': 'id,name,description,start_time,end_time,place,cover,category,attending_count,interested_count,owner',
          'limit': 100
        }
      });
      
      // Process and normalize events
      return this.processEvents(response.data || []);
    } catch (error) {
      log(`Error fetching Facebook events: ${error instanceof Error ? error.message : String(error)}`, 'facebook-api');
      return [];
    }
  },
  
  /**
   * Process raw Facebook events into normalized format
   * @param events Raw Facebook event data
   * @returns Normalized events
   */
  processEvents(events: FacebookEvent[]): Event[] {
    return events
      .filter(event => !!event.name && !!event.start_time)
      .map(event => {
        // Build event location string
        let location = '';
        if (event.place) {
          if (event.place.name) {
            location = event.place.name;
          }
          
          if (event.place.location) {
            const loc = event.place.location;
            const locParts = [];
            
            if (loc.street) locParts.push(loc.street);
            if (loc.city) locParts.push(loc.city);
            if (loc.zip) locParts.push(loc.zip);
            if (loc.country) locParts.push(loc.country);
            
            if (locParts.length > 0) {
              location += location ? `, ${locParts.join(', ')}` : locParts.join(', ');
            }
          }
        }
        
        // Get coordinates for the event
        let latitude = 0;
        let longitude = 0;
        
        if (event.place?.location?.latitude && event.place?.location?.longitude) {
          [longitude, latitude] = EventAdapter.normalizeCoordinates(
            event.place.location.latitude,
            event.place.location.longitude
          );
        }
        
        // Determine if this is a featured event
        const popularity = (event.attending_count || 0) + (event.interested_count || 0);
        const isFeatured = popularity > 50;
        
        // Convert to standard event format
        const standardEvent: Omit<Event, 'id'> = {
          title: event.name,
          description: event.description || '',
          longDescription: event.description || null,
          date: new Date(event.start_time),
          endDate: event.end_time ? new Date(event.end_time) : null,
          location,
          venue: event.place?.name || null,
          category: EventAdapter.mapCategory(event.category || ''),
          imageUrl: event.cover?.source || '',
          organizer: event.owner?.name || '',
          organizerImageUrl: null,
          source: 'facebook',
          sourceUrl: `https://facebook.com/events/${event.id}`,
          latitude,
          longitude,
          featured: isFeatured
        };
        
        return standardEvent as Event;
      });
  }
};

// Types for Facebook API responses
interface FacebookEventsResponse {
  data?: FacebookEvent[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  category?: string;
  place?: {
    id: string;
    name: string;
    location?: {
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      street?: string;
      zip?: string;
    }
  };
  cover?: {
    id: string;
    source: string;
    offset_x: number;
    offset_y: number;
  };
  attending_count?: number;
  interested_count?: number;
  owner?: {
    id: string;
    name: string;
  };
}