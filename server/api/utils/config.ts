import { log } from '../../vite';

/**
 * API configuration and credentials manager
 */
export class ApiConfig {
  /**
   * Get API key for Facebook Graph API
   */
  static getFacebookApiKey(): string {
    const apiKey = process.env.FACEBOOK_API_KEY;
    if (!apiKey) {
      log('Facebook API key not found in environment variables', 'api-config');
    }
    return apiKey || '';
  }
  
  /**
   * Get API key for Eventbrite API
   */
  static getEventbriteApiKey(): string {
    const apiKey = process.env.EVENTBRITE_API_KEY;
    if (!apiKey) {
      log('Eventbrite API key not found in environment variables', 'api-config');
    }
    return apiKey || '';
  }
  
  /**
   * Get API key for Meetup API
   */
  static getMeetupApiKey(): string {
    const apiKey = process.env.MEETUP_API_KEY;
    if (!apiKey) {
      log('Meetup API key not found in environment variables', 'api-config');
    }
    return apiKey || '';
  }
  
  /**
   * Get API key for Brussels Open Data Portal
   */
  static getBrusselsOpenDataApiKey(): string {
    const apiKey = process.env.BRUSSELS_OPEN_DATA_API_KEY;
    if (!apiKey) {
      log('Brussels Open Data API key not found in environment variables', 'api-config');
    }
    return apiKey || '';
  }
  
  /**
   * Get API key for Ticketmaster Discovery API
   */
  static getTicketmasterApiKey(): string {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      log('Ticketmaster API key not found in environment variables', 'api-config');
    }
    return apiKey || '';
  }
  
  /**
   * Checks if an API provider is configured with valid credentials
   * @param provider Name of the API provider
   * @returns Whether the provider is properly configured
   */
  static isProviderConfigured(provider: 'facebook' | 'eventbrite' | 'meetup' | 'brussels_open_data' | 'ticketmaster'): boolean {
    switch (provider) {
      case 'facebook':
        return !!this.getFacebookApiKey();
      case 'eventbrite':
        return !!this.getEventbriteApiKey();
      case 'meetup':
        return !!this.getMeetupApiKey();
      case 'brussels_open_data':
        return !!this.getBrusselsOpenDataApiKey();
      case 'ticketmaster':
        return !!this.getTicketmasterApiKey();
      default:
        return false;
    }
  }
  
  /**
   * Get Brussels location coordinates for geographically bound queries
   */
  static getBrusselsCoordinates(): { lat: number, lng: number, radius: number } {
    return {
      // Central Brussels (Grand Place)
      lat: 50.8476,
      lng: 4.3572,
      radius: 10 // kilometers
    };
  }
}