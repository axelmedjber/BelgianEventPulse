import { Event } from '../../../shared/schema';
import { ApiClient } from '../utils/api-client';
import { ApiConfig } from '../utils/config';
import { EventAdapter } from '../utils/event-adapter';
import { log } from '../../vite';

// Ticketmaster Discovery API client
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

/**
 * Ticketmaster Discovery API provider
 */
export const ticketmaster = {
  /**
   * Fetches events from Ticketmaster Discovery API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    const apiKey = ApiConfig.getTicketmasterApiKey();
    if (!apiKey) {
      log('Ticketmaster API key not available, skipping...', 'ticketmaster-api');
      return [];
    }
    
    try {
      // Create API client
      const client = new ApiClient(TICKETMASTER_BASE_URL);
      
      // Get Brussels coordinates for searching nearby
      const { lat, lng, radius } = ApiConfig.getBrusselsCoordinates();
      
      // Format dates for Ticketmaster API (ISO 8601)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const startDateTime = today.toISOString().replace(/\.\d+Z$/, 'Z');
      const endDateTime = nextWeek.toISOString().replace(/\.\d+Z$/, 'Z');
      
      // Fetch events in Brussels area
      const response = await client.get<TicketmasterResponse>('/events', {
        params: {
          'apikey': apiKey,
          'latlong': `${lat},${lng}`,
          'radius': radius,
          'unit': 'km',
          'locale': '*',
          'startDateTime': startDateTime,
          'endDateTime': endDateTime,
          'size': 100,
          'sort': 'date,asc',
          'city': 'Brussels',
          'countryCode': 'BE'
        }
      });
      
      // Process and normalize events
      if (response._embedded?.events) {
        return this.processEvents(response._embedded.events);
      }
      
      return [];
    } catch (error) {
      log(`Error fetching Ticketmaster events: ${error instanceof Error ? error.message : String(error)}`, 'ticketmaster-api');
      return [];
    }
  },
  
  /**
   * Process raw Ticketmaster events into normalized format
   * @param events Raw Ticketmaster event data
   * @returns Normalized events
   */
  processEvents(events: TicketmasterEvent[]): Event[] {
    return events
      .filter(event => !!event.name && !!event.dates?.start?.dateTime)
      .map(event => {
        // Handle location
        let location = '';
        let venue = null;
        let latitude = 0;
        let longitude = 0;
        
        if (event._embedded?.venues && event._embedded.venues.length > 0) {
          const venueData = event._embedded.venues[0];
          venue = venueData.name;
          
          // Build location string
          const locParts = [];
          
          if (venueData.address?.line1) locParts.push(venueData.address.line1);
          if (venueData.city?.name) locParts.push(venueData.city.name);
          if (venueData.postalCode) locParts.push(venueData.postalCode);
          if (venueData.country?.name) locParts.push(venueData.country.name);
          
          location = locParts.join(', ');
          
          // Get venue coordinates
          if (venueData.location?.latitude && venueData.location?.longitude) {
            [longitude, latitude] = EventAdapter.normalizeCoordinates(
              venueData.location.latitude,
              venueData.location.longitude
            );
          }
        }
        
        // Determine category from classifications
        let category = '';
        if (event.classifications && event.classifications.length > 0) {
          const classification = event.classifications[0];
          
          const segments = [];
          if (classification.segment?.name && classification.segment.name !== 'Undefined') {
            segments.push(classification.segment.name);
          }
          
          if (classification.genre?.name && classification.genre.name !== 'Undefined') {
            segments.push(classification.genre.name);
          }
          
          if (classification.subGenre?.name && classification.subGenre.name !== 'Undefined') {
            segments.push(classification.subGenre.name);
          }
          
          category = segments.join(', ');
        }
        
        // Get the best available image
        let imageUrl = '';
        if (event.images && event.images.length > 0) {
          // Find the largest image
          const sortedImages = [...event.images].sort((a, b) => {
            const aSize = (a.width || 0) * (a.height || 0);
            const bSize = (b.width || 0) * (b.height || 0);
            return bSize - aSize;
          });
          
          if (sortedImages[0]) {
            imageUrl = sortedImages[0].url;
          }
        }
        
        // Format date
        const startDate = new Date(event.dates.start.dateTime);
        
        // Convert to standard event format
        const standardEvent: Omit<Event, 'id'> = {
          title: event.name,
          description: event.info || event.pleaseNote || '',
          longDescription: event.info || event.pleaseNote || null,
          date: startDate,
          endDate: null, // Ticketmaster often doesn't provide end times
          location,
          venue,
          category: EventAdapter.mapCategory(category),
          imageUrl,
          organizer: event.promoter?.name || '',
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

// Types for Ticketmaster API responses
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