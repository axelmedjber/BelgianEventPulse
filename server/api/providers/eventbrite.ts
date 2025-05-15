import { Event } from '../../../shared/schema';
import { ApiClient } from '../utils/api-client';
import { ApiConfig } from '../utils/config';
import { EventAdapter } from '../utils/event-adapter';
import { log } from '../../vite';

// Eventbrite API client 
const EVENTBRITE_BASE_URL = 'https://www.eventbriteapi.com/v3';

/**
 * Eventbrite API provider
 */
export const eventbrite = {
  /**
   * Fetches events from Eventbrite API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    const apiKey = ApiConfig.getEventbriteApiKey();
    if (!apiKey) {
      log('Eventbrite API key not available, skipping...', 'eventbrite-api');
      return [];
    }
    
    try {
      // Create API client
      const client = new ApiClient(EVENTBRITE_BASE_URL, {
        'Authorization': `Bearer ${apiKey}`
      });
      
      // Get Brussels coordinates for searching nearby
      const { lat, lng, radius } = ApiConfig.getBrusselsCoordinates();
      
      // Format dates for Eventbrite API (ISO 8601)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Fetch events in Brussels area
      const response = await client.get<EventbriteSearchResponse>('/events/search', {
        params: {
          'location.latitude': lat,
          'location.longitude': lng,
          'location.within': `${radius}km`,
          'start_date.range_start': today.toISOString(),
          'start_date.range_end': nextWeek.toISOString(),
          'expand': 'venue,organizer,category',
          'sort_by': 'date',
          'page_size': 50
        }
      });
      
      // Process and normalize events
      return this.processEvents(response.events || []);
    } catch (error) {
      log(`Error fetching Eventbrite events: ${error instanceof Error ? error.message : String(error)}`, 'eventbrite-api');
      return [];
    }
  },
  
  /**
   * Process raw Eventbrite events into normalized format
   * @param events Raw Eventbrite event data
   * @returns Normalized events
   */
  processEvents(events: EventbriteEvent[]): Event[] {
    return events
      .filter(event => !!event.name?.text && !!event.start?.local)
      .map(event => {
        // Build location string
        let location = '';
        let venue = null;
        let latitude = 0;
        let longitude = 0;
        
        if (event.venue) {
          venue = event.venue.name;
          const addressParts = [];
          
          if (event.venue.address?.address_1) addressParts.push(event.venue.address.address_1);
          if (event.venue.address?.address_2) addressParts.push(event.venue.address.address_2);
          if (event.venue.address?.city) addressParts.push(event.venue.address.city);
          if (event.venue.address?.postal_code) addressParts.push(event.venue.address.postal_code);
          if (event.venue.address?.country) addressParts.push(event.venue.address.country);
          
          location = addressParts.join(', ');
          
          // Get venue coordinates
          if (event.venue.latitude && event.venue.longitude) {
            [longitude, latitude] = EventAdapter.normalizeCoordinates(
              event.venue.latitude,
              event.venue.longitude
            );
          }
        }
        
        // Determine category
        let category = event.category?.name || '';
        if (event.subcategory?.name) {
          category += `, ${event.subcategory.name}`;
        }
        
        // Convert to standard event format
        const standardEvent: Omit<Event, 'id'> = {
          title: event.name.text,
          description: event.description?.text || '',
          longDescription: event.description?.html || null,
          date: new Date(event.start.local),
          endDate: event.end?.local ? new Date(event.end.local) : null,
          location,
          venue,
          category: EventAdapter.mapCategory(category),
          imageUrl: event.logo?.url || '',
          organizer: event.organizer?.name || '',
          organizerImageUrl: null,
          source: 'eventbrite',
          sourceUrl: event.url,
          latitude,
          longitude,
          featured: event.listed && event.is_free === false // Example feature criteria
        };
        
        return standardEvent as Event;
      });
  }
};

// Types for Eventbrite API responses
interface EventbriteSearchResponse {
  pagination: {
    object_count: number;
    page_number: number;
    page_size: number;
    page_count: number;
    has_more_items: boolean;
  };
  events: EventbriteEvent[];
}

interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description?: {
    text: string;
    html: string;
  };
  url: string;
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  created: string;
  changed: string;
  capacity: number;
  capacity_is_custom: boolean;
  status: string;
  currency: string;
  listed: boolean;
  shareable: boolean;
  invite_only: boolean;
  online_event: boolean;
  show_remaining: boolean;
  is_free: boolean;
  venue?: {
    id: string;
    name: string;
    latitude?: string;
    longitude?: string;
    address?: {
      address_1?: string;
      address_2?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
      localized_address_display?: string;
      localized_area_display?: string;
    }
  };
  logo?: {
    id: string;
    url: string;
    aspect_ratio: string;
    edge_color: string;
    edge_color_set: boolean;
  };
  organizer?: {
    id: string;
    name: string;
    description?: {
      text?: string;
      html?: string;
    };
    long_description?: {
      text?: string;
      html?: string;
    };
    logo_id?: string;
    logo?: {
      id: string;
      url: string;
    }
  };
  category?: {
    id: string;
    name: string;
    name_localized: string;
    short_name: string;
    short_name_localized: string;
  };
  subcategory?: {
    id: string;
    name: string;
    name_localized: string;
    short_name: string;
    short_name_localized: string;
  };
}