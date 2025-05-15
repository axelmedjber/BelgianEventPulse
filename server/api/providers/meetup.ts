import { Event } from "@shared/schema";
import { EventAdapter } from "../utils/event-adapter";
import { log } from "../../vite";

/**
 * Meetup API provider
 */
export const meetup = {
  /**
   * Fetches events from Meetup API
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    try {
      log('Fetching events from Meetup...', 'meetup-api');
      
      // Check if API key is configured
      const apiKey = process.env.MEETUP_API_KEY;
      if (!apiKey) {
        log('Meetup API key not found in environment variables', 'api-config');
        log('Meetup API key not available, skipping...', 'meetup-api');
        return [];
      }
      
      // Real implementation would fetch from Meetup API
      // For demo, we'll return an empty array unless we have an API key
      /*
      const response = await fetch(
        `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=4.35&lat=50.85&page=50&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Meetup API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.events || !Array.isArray(data.events)) {
        return [];
      }
      
      return this.processEvents(data.events);
      */
      return [];
    } catch (error) {
      log(`Error fetching from Meetup: ${error instanceof Error ? error.message : String(error)}`, 'meetup-api');
      return [];
    }
  },
  
  /**
   * Process raw Meetup events into normalized format
   * @param events Raw Meetup event data
   * @returns Normalized events
   */
  processEvents(events: MeetupEvent[]): Event[] {
    return events.filter(event => !!event.name).map(event => {
      // Extract location data
      let location = 'Brussels, Belgium';
      let latitude = 50.85045;
      let longitude = 4.34878;
      
      if (event.venue) {
        const venue = event.venue;
        
        const addressParts = [];
        if (venue.address_1) addressParts.push(venue.address_1);
        if (venue.city) addressParts.push(venue.city);
        if (venue.state) addressParts.push(venue.state);
        if (venue.country) addressParts.push(venue.country);
        
        if (addressParts.length > 0) {
          location = addressParts.join(', ');
        }
        
        if (venue.lat !== undefined && venue.lon !== undefined) {
          latitude = venue.lat;
          longitude = venue.lon;
        }
      }
      
      // Date handling
      const localDate = event.local_date;
      const localTime = event.local_time || '19:00:00';
      const eventDate = new Date(`${localDate}T${localTime}`);
      
      // Determine category
      let category = 'cultural';
      if (event.group?.category?.name) {
        category = EventAdapter.mapCategory(event.group.category.name);
      }
      
      // Convert to standard event format
      const standardEvent: Omit<Event, 'id'> = {
        title: event.name,
        description: event.description || '',
        longDescription: event.description || null,
        date: eventDate,
        endDate: event.duration ? new Date(eventDate.getTime() + event.duration) : null,
        location,
        venue: event.venue?.name || null,
        category,
        imageUrl: event.featured_photo?.highres_link || event.featured_photo?.photo_link || 'https://via.placeholder.com/400x200?text=Meetup+Event',
        organizer: event.group?.name || 'Meetup Group',
        organizerImageUrl: null,
        source: 'meetup',
        sourceUrl: event.link,
        latitude,
        longitude,
        featured: (event.yes_rsvp_count || 0) > 20
      };
      
      return standardEvent as Event;
    });
  }
};

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