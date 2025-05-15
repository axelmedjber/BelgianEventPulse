import { Event } from '../../../shared/schema';
import { ApiClient } from '../utils/api-client';
import { ApiConfig } from '../utils/config';
import { EventAdapter } from '../utils/event-adapter';
import { log } from '../../vite';

// Meetup API client
const MEETUP_BASE_URL = 'https://api.meetup.com';

/**
 * Meetup API provider
 */
export const meetup = {
  /**
   * Fetches events from Meetup API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    const apiKey = ApiConfig.getMeetupApiKey();
    if (!apiKey) {
      log('Meetup API key not available, skipping...', 'meetup-api');
      return [];
    }
    
    try {
      // Create API client
      const client = new ApiClient(MEETUP_BASE_URL, {
        'Authorization': `Bearer ${apiKey}`
      });
      
      // Get Brussels coordinates for searching nearby
      const { lat, lng, radius } = ApiConfig.getBrusselsCoordinates();
      
      // Format dates for Meetup API
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Fetch events in Brussels area
      const response = await client.get<MeetupEvent[]>('/find/upcoming_events', {
        params: {
          'lat': lat,
          'lon': lng,
          'radius': radius,
          'end_date_range': nextWeek.toISOString(),
          'fields': 'featured_photo,group_category,venue,description,fee',
          'page': 100
        }
      });
      
      // Process and normalize events
      return this.processEvents(response || []);
    } catch (error) {
      log(`Error fetching Meetup events: ${error instanceof Error ? error.message : String(error)}`, 'meetup-api');
      return [];
    }
  },
  
  /**
   * Process raw Meetup events into normalized format
   * @param events Raw Meetup event data
   * @returns Normalized events
   */
  processEvents(events: MeetupEvent[]): Event[] {
    return events
      .filter(event => !!event.name && !!event.time)
      .map(event => {
        // Build location string
        let location = '';
        let venue = null;
        let latitude = 0;
        let longitude = 0;
        
        if (event.venue) {
          venue = event.venue.name;
          const locParts = [];
          
          if (event.venue.address_1) locParts.push(event.venue.address_1);
          if (event.venue.address_2) locParts.push(event.venue.address_2);
          if (event.venue.address_3) locParts.push(event.venue.address_3);
          if (event.venue.city) locParts.push(event.venue.city);
          if (event.venue.zip) locParts.push(event.venue.zip);
          if (event.venue.country) locParts.push(event.venue.country);
          
          location = locParts.join(', ');
          
          // Get venue coordinates
          if (event.venue.lat && event.venue.lon) {
            [longitude, latitude] = EventAdapter.normalizeCoordinates(
              event.venue.lat,
              event.venue.lon
            );
          }
        } else {
          // If no venue, use group location
          if (event.group?.localized_location) {
            location = event.group.localized_location;
          }
        }
        
        // Determine category from group's category
        let category = '';
        if (event.group?.category?.name) {
          category = event.group.category.name;
        }
        
        // Determine if this is a featured event (paid events and those with high attendance)
        const isPaid = event.fee && event.fee.amount > 0;
        const highAttendance = (event.yes_rsvp_count || 0) > 20;
        const featured = isPaid || highAttendance;
        
        // Get event image if available
        let imageUrl = '';
        if (event.featured_photo?.photo_link) {
          imageUrl = event.featured_photo.photo_link;
        }
        
        // Convert to standard event format
        const standardEvent: Omit<Event, 'id'> = {
          title: event.name,
          description: event.description || '',
          longDescription: event.description || null,
          date: new Date(event.time),
          endDate: event.duration ? new Date(event.time + event.duration) : null,
          location,
          venue,
          category: EventAdapter.mapCategory(category),
          imageUrl,
          organizer: event.group?.name || '',
          organizerImageUrl: null,
          source: 'meetup',
          sourceUrl: event.link,
          latitude,
          longitude,
          featured
        };
        
        return standardEvent as Event;
      });
  }
};

// Types for Meetup API responses
interface MeetupEvent {
  id: string;
  name: string;
  description?: string;
  link: string;
  time: number;
  duration?: number;
  waitlist_count: number;
  yes_rsvp_count: number;
  local_date: string;
  local_time: string;
  utc_offset: number;
  venue?: {
    id: number;
    name: string;
    address_1?: string;
    address_2?: string;
    address_3?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  featured_photo?: {
    id: number;
    photo_link: string;
    thumb_link: string;
    highres_link?: string;
  };
  group?: {
    id: number;
    name: string;
    urlname: string;
    localized_location: string;
    category?: {
      id: number;
      name: string;
      shortname: string;
    }
  };
  fee?: {
    amount: number;
    currency: string;
    description: string;
    required: boolean;
  };
}