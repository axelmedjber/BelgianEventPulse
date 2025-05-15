import { Event, EventCategory, EventSource } from '../../../shared/schema';

/**
 * Utility for adapting events from different API sources to a common format
 */
export class EventAdapter {
  /**
   * Maps a provider's category to our standard event categories
   * @param providerCategory Original category from event provider
   * @returns Standardized event category
   */
  static mapCategory(providerCategory: string): EventCategory {
    // Map to standardized categories
    const categoryMap: Record<string, EventCategory> = {
      // Music categories
      'music': 'music',
      'concert': 'music',
      'festival': 'music',
      'performance': 'music',
      'gig': 'music',
      'dj': 'music',
      'jazz': 'music',
      'rock': 'music',
      'pop': 'music',
      'classical': 'music',
      'opera': 'music',
      
      // Art categories
      'art': 'art',
      'exhibition': 'art',
      'gallery': 'art',
      'museum': 'art',
      'visual': 'art',
      'painting': 'art',
      'sculpture': 'art',
      
      // Food categories
      'food': 'food',
      'drink': 'food',
      'dinner': 'food',
      'tasting': 'food',
      'restaurant': 'food',
      'cuisine': 'food',
      'gastronomy': 'food',
      'culinary': 'food',
      
      // Sports categories
      'sports': 'sports',
      'sport': 'sports',
      'fitness': 'sports',
      'match': 'sports',
      'game': 'sports',
      'running': 'sports',
      'race': 'sports',
      'athletic': 'sports',
      
      // Nightlife categories
      'nightlife': 'nightlife',
      'party': 'nightlife',
      'club': 'nightlife',
      'bar': 'nightlife',
      'pub': 'nightlife',
      'disco': 'nightlife',
      
      // Cultural categories
      'cultural': 'cultural',
      'heritage': 'cultural',
      'history': 'cultural',
      'tour': 'cultural',
      'workshop': 'cultural',
      'lecture': 'cultural',
      'talk': 'cultural',
      
      // Theater categories
      'theater': 'theater',
      'theatre': 'theater',
      'play': 'theater',
      'drama': 'theater',
      'comedy': 'theater',
      'acting': 'theater',
      'performance art': 'theater',
      'stage': 'theater',
    };
    
    // Clean and normalize the provider category
    const normalized = providerCategory.toLowerCase().trim();
    
    // Try to find a direct match
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalized === key || normalized.includes(key)) {
        return value;
      }
    }
    
    // Default to 'cultural' if no match is found
    return 'cultural';
  }
  
  /**
   * Determines whether an event is a featured event
   * @param event Event to check
   * @returns Whether the event should be featured
   */
  static determineIfFeatured(event: Partial<Event>): boolean {
    // Example logic for featuring events
    // Events could be featured based on popularity, size, special flags, etc.
    const isTrending = event.source === 'ticketmaster'; // Example based on source
    const hasImage = !!event.imageUrl;
    const isPopular = event.title?.toLowerCase().includes('festival');
    
    return !!(isTrending || (hasImage && isPopular));
  }
  
  /**
   * Convert location coordinates to a consistent format
   * @param lat Latitude
   * @param lng Longitude
   * @returns Formatted coordinates
   */
  static normalizeCoordinates(lat: string | number, lng: string | number): [number, number] {
    return [
      typeof lng === 'string' ? parseFloat(lng) : lng,
      typeof lat === 'string' ? parseFloat(lat) : lat
    ];
  }
  
  /**
   * Creates a standardized event object from different API sources
   * @param rawEvent Raw event data from an API
   * @param source Source API identifier
   * @returns Standardized event object
   */
  static createEvent(rawEvent: any, source: EventSource): Partial<Event> {
    // Create a base event with common fields
    const event: Partial<Event> = {
      source,
      // We'll set the ID in the storage layer
      title: '',
      date: new Date(),
      description: '',
      location: '',
      category: 'cultural', // Default category
      imageUrl: '',
      organizer: '',
      latitude: 0,
      longitude: 0
    };
    
    return event;
  }
  
  /**
   * Extract a URL from a text description or object
   * @param data Text or object that might contain a URL
   * @returns URL if found, otherwise an empty string
   */
  static extractUrl(data: any): string {
    if (!data) return '';
    
    if (typeof data === 'string') {
      // Find URL in text using regex
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = data.match(urlRegex);
      return match ? match[0] : '';
    }
    
    if (typeof data === 'object') {
      // Check common URL fields in objects
      const possibleUrlFields = ['url', 'link', 'href', 'uri', 'web', 'website', 'seeUrl'];
      for (const field of possibleUrlFields) {
        if (data[field] && typeof data[field] === 'string') {
          return data[field];
        }
      }
    }
    
    return '';
  }
}