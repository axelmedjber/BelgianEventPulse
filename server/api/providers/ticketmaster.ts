import { Event } from "@shared/schema";
import { EventAdapter } from "../utils/event-adapter";
import { log } from "../../vite";

/**
 * Ticketmaster Discovery API provider
 */
export const ticketmaster = {
  /**
   * Fetches events from Ticketmaster Discovery API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    try {
      log('Fetching events from Ticketmaster...', 'ticketmaster-api');
      
      // Check if API key is configured
      const apiKey = process.env.TICKETMASTER_API_KEY;
      if (!apiKey) {
        log('Ticketmaster API key not found in environment variables', 'api-config');
        log('Ticketmaster API key not available, skipping...', 'ticketmaster-api');
        return [];
      }
      
      // Real implementation would fetch from Ticketmaster API
      // For demo, we'll return an empty array unless we have an API key
      /*
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=Brussels&countryCode=BE&size=100`
      );
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API returned ${response.status}: ${response.statusText}`);
      }
      
      const data: TicketmasterResponse = await response.json();
      
      if (!data._embedded?.events || !Array.isArray(data._embedded.events)) {
        return [];
      }
      
      return this.processEvents(data._embedded.events);
      */
      return [];
    } catch (error) {
      log(`Error fetching from Ticketmaster: ${error instanceof Error ? error.message : String(error)}`, 'ticketmaster-api');
      return [];
    }
  },
  
  /**
   * Process raw Ticketmaster events into normalized format
   * @param events Raw Ticketmaster event data
   * @returns Normalized events
   */
  processEvents(events: TicketmasterEvent[]): Event[] {
    return events.filter(event => !!event.name).map(event => {
      // Extract location data
      let location = 'Brussels, Belgium';
      let venue = null;
      let latitude = 50.85045;
      let longitude = 4.34878;
      
      if (event._embedded?.venues && event._embedded.venues.length > 0) {
        const venueData = event._embedded.venues[0];
        
        venue = venueData.name;
        
        const addressParts = [];
        if (venueData.address?.line1) addressParts.push(venueData.address.line1);
        if (venueData.city?.name) addressParts.push(venueData.city.name);
        if (venueData.state?.name) addressParts.push(venueData.state.name);
        if (venueData.country?.name) addressParts.push(venueData.country.name);
        
        if (addressParts.length > 0) {
          location = addressParts.join(', ');
        }
        
        if (venueData.location?.latitude && venueData.location?.longitude) {
          latitude = parseFloat(venueData.location.latitude);
          longitude = parseFloat(venueData.location.longitude);
        }
      }
      
      // Determine category
      let category = 'cultural';
      if (event.classifications && event.classifications.length > 0) {
        const classifications = event.classifications[0];
        
        // Use segment (main category) or genre if available
        const categoryName = classifications.segment?.name || classifications.genre?.name;
        if (categoryName) {
          category = EventAdapter.mapCategory(categoryName);
        }
      }
      
      // Get the best image
      let imageUrl = 'https://via.placeholder.com/400x200?text=Ticketmaster+Event';
      if (event.images && event.images.length > 0) {
        // Try to get a landscape ratio image first
        const landscapeImage = event.images.find(img => img.ratio === '16_9');
        if (landscapeImage) {
          imageUrl = landscapeImage.url;
        } else {
          // Otherwise use the first image
          imageUrl = event.images[0].url;
        }
      }
      
      // Date handling
      let eventDate = new Date();
      let endDate = null;
      
      if (event.dates?.start) {
        const start = event.dates.start;
        if (start.dateTime) {
          eventDate = new Date(start.dateTime);
        } else if (start.localDate) {
          // Default to evening if only date is provided
          const time = start.localTime || '19:00:00';
          eventDate = new Date(`${start.localDate}T${time}`);
        }
      }
      
      // Convert to standard event format
      const standardEvent: Omit<Event, 'id'> = {
        title: event.name,
        description: event.info || event.pleaseNote || '',
        longDescription: event.info || event.pleaseNote || null,
        date: eventDate,
        endDate,
        location,
        venue,
        category,
        imageUrl,
        organizer: event.promoter?.name || 'Ticketmaster Event',
        organizerImageUrl: null,
        source: 'ticketmaster',
        sourceUrl: event.url,
        latitude,
        longitude,
        featured: event.dates?.status?.code === 'onsale' || (event.rank && event.rank > 0) || false
      };
      
      return standardEvent as Event;
    });
  }
};

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface TicketmasterEvent {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  info?: string;
  pleaseNote?: string;
  distances?: {
    computed: boolean;
    straight: number;
  };
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  dates: {
    start: {
      localDate: string;
      localTime: string;
      dateTime: string;
      dateTBD: boolean;
      dateTBA: boolean;
      timeTBA: boolean;
      noSpecificTime: boolean;
    };
    timezone?: string;
    status?: {
      code: string;
    };
    spanMultipleDays?: boolean;
  };
  classifications?: Array<{
    primary: boolean;
    segment?: {
      id: string;
      name: string;
    };
    genre?: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
    family?: boolean;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      type: string;
      id: string;
      test: boolean;
      url?: string;
      locale: string;
      address?: {
        line1: string;
      };
      city?: {
        name: string;
      };
      state?: {
        name: string;
        stateCode: string;
      };
      country?: {
        name: string;
        countryCode: string;
      };
      postalCode?: string;
      location?: {
        longitude: string;
        latitude: string;
      };
    }>;
  };
  images?: Array<{
    ratio?: string;
    url: string;
    width?: number;
    height?: number;
    fallback?: boolean;
  }>;
  sales?: {
    public?: {
      startDateTime: string;
      endDateTime: string;
    };
  };
  rank?: number;
}