import { Event } from "@shared/schema";
import { EventAdapter } from "../utils/event-adapter";
import { log } from "../../vite";

/**
 * Eventbrite API provider
 */
export const eventbrite = {
  /**
   * Fetches events from Eventbrite API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    try {
      log('Fetching events from Eventbrite...', 'eventbrite-api');
      
      // In a real implementation, this would use the Eventbrite API
      // For demo purposes, return empty array since we don't have API credentials
      log('Eventbrite API not configured, skipping...', 'eventbrite-api');
      return [];
      
      // Real implementation would fetch from Eventbrite API
      /*
      const response = await fetch(
        'https://www.eventbriteapi.com/v3/events/search/?location.address=brussels&expand=venue,organizer&token=YOUR_API_KEY'
      );
      
      if (!response.ok) {
        throw new Error(`Eventbrite API returned ${response.status}: ${response.statusText}`);
      }
      
      const data: EventbriteSearchResponse = await response.json();
      
      if (!data.events || !Array.isArray(data.events)) {
        return [];
      }
      
      return this.processEvents(data.events);
      */
    } catch (error) {
      log(`Error fetching from Eventbrite: ${error instanceof Error ? error.message : String(error)}`, 'eventbrite-api');
      return [];
    }
  },
  
  /**
   * Process raw Eventbrite events into normalized format
   * @param events Raw Eventbrite event data
   * @returns Normalized events
   */
  processEvents(events: EventbriteEvent[]): Event[] {
    return events.filter(event => !!event.name?.text).map(event => {
      // Extract location data
      let location = 'Brussels, Belgium';
      let latitude = 50.85045;
      let longitude = 4.34878;
      
      if (event.venue) {
        const venue = event.venue;
        
        if (venue.address) {
          const addressParts = [];
          
          if (venue.address.address_1) addressParts.push(venue.address.address_1);
          if (venue.address.city) addressParts.push(venue.address.city);
          if (venue.address.region) addressParts.push(venue.address.region);
          if (venue.address.postal_code) addressParts.push(venue.address.postal_code);
          if (venue.address.country) addressParts.push(venue.address.country);
          
          if (addressParts.length > 0) {
            location = addressParts.join(', ');
          }
        }
        
        if (venue.latitude && venue.longitude) {
          latitude = parseFloat(venue.latitude);
          longitude = parseFloat(venue.longitude);
        }
      }
      
      // Determine category
      let category = 'cultural';
      if (event.category?.name) {
        category = EventAdapter.mapCategory(event.category.name);
      }
      
      // Convert to standard event format
      const standardEvent: Omit<Event, 'id'> = {
        title: event.name.text,
        description: event.description?.text || '',
        longDescription: event.description?.text || null,
        date: new Date(event.start.utc),
        endDate: new Date(event.end.utc),
        location,
        venue: event.venue?.name || null,
        category,
        imageUrl: event.logo?.url || 'https://via.placeholder.com/400x200?text=Event',
        organizer: event.organizer?.name || 'Eventbrite Event',
        organizerImageUrl: event.organizer?.logo?.url || null,
        source: 'eventbrite',
        sourceUrl: event.url,
        latitude,
        longitude,
        featured: !event.is_free || event.listed
      };
      
      return standardEvent as Event;
    });
  }
};

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