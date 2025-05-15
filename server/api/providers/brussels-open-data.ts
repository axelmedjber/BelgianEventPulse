import { Event } from '../../../shared/schema';
import { ApiClient } from '../utils/api-client';
import { ApiConfig } from '../utils/config';
import { EventAdapter } from '../utils/event-adapter';
import { log } from '../../vite';

// Brussels Open Data Portal API client
const BRUSSELS_OPEN_DATA_BASE_URL = 'https://opendata.brussels.be/api/v2';

/**
 * Brussels Open Data Portal API provider
 */
export const brusselsOpenData = {
  /**
   * Fetches events from Brussels Open Data Portal
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    const apiKey = ApiConfig.getBrusselsOpenDataApiKey();
    
    try {
      // Create API client (some Open Data portals don't require authentication)
      const client = new ApiClient(BRUSSELS_OPEN_DATA_BASE_URL, 
        apiKey ? { 'Authorization': `Apikey ${apiKey}` } : {});
      
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      // Get date one week from now
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekFormatted = nextWeek.toISOString().split('T')[0];
      
      // Create a query for cultural events in Brussels happening in the next week
      const query = `SELECT * WHERE event_type IS NOT NULL AND start_date >= '${todayFormatted}' AND start_date <= '${nextWeekFormatted}'`;
      
      // Fetch events from the cultural events dataset
      // Note: Dataset ID will vary based on the actual Brussels Open Data portal structure
      const response = await client.get<BrusselsOpenDataResponse>('/catalog/datasets/cultural-events/records', {
        params: {
          'where': query,
          'limit': 100,
          'timezone': 'Europe/Brussels'
        }
      });
      
      // Process and normalize events
      return this.processEvents(response.records || []);
    } catch (error) {
      log(`Error fetching Brussels Open Data events: ${error instanceof Error ? error.message : String(error)}`, 'brussels-api');
      
      // If error is 404 or similar, the dataset might not exist or be named differently
      // Fall back to an empty array rather than failing completely
      return [];
    }
  },
  
  /**
   * Process raw Brussels Open Data events into normalized format
   * @param events Raw Brussels Open Data event records
   * @returns Normalized events
   */
  processEvents(events: BrusselsOpenDataRecord[]): Event[] {
    return events
      .filter(record => !!record.fields?.title && !!record.fields?.start_date)
      .map(record => {
        const fields = record.fields;
        
        // Handle location
        let location = '';
        if (fields.location_name) {
          location = fields.location_name;
        }
        
        if (fields.address) {
          location += location ? `, ${fields.address}` : fields.address;
        }
        
        if (fields.municipality) {
          location += location ? `, ${fields.municipality}` : fields.municipality;
        }
        
        if (fields.zip_code) {
          location += location ? ` ${fields.zip_code}` : fields.zip_code;
        }
        
        // Handle coordinates
        let latitude = 0;
        let longitude = 0;
        
        if (fields.geo_point_2d && Array.isArray(fields.geo_point_2d) && fields.geo_point_2d.length === 2) {
          // Often geo points are stored as [lat, lng] arrays
          [latitude, longitude] = fields.geo_point_2d;
        } else if (fields.latitude && fields.longitude) {
          // Or sometimes as separate fields
          latitude = fields.latitude;
          longitude = fields.longitude;
        }
        
        // Handle dates
        const startDate = fields.start_date ? new Date(fields.start_date) : new Date();
        let endDate = null;
        
        if (fields.end_date) {
          endDate = new Date(fields.end_date);
        }
        
        // Determine category
        let category = '';
        if (fields.event_type) {
          category = fields.event_type;
        }
        if (fields.theme) {
          category += category ? `, ${fields.theme}` : fields.theme;
        }
        // Default category if none found
        if (!category) {
          category = 'cultural';
        }
        
        // Convert to standard event format
        const standardEvent: Omit<Event, 'id'> = {
          title: fields.title || 'Brussels Event',
          description: fields.description || '',
          longDescription: fields.long_description || fields.description || null,
          date: startDate,
          endDate,
          location,
          venue: fields.location_name || null,
          category: EventAdapter.mapCategory(category),
          imageUrl: fields.image_url || fields.thumbnail_url || '',
          organizer: fields.organizer || '',
          organizerImageUrl: null,
          source: 'brussels_open_data',
          sourceUrl: fields.url || (record.record_id 
            ? `https://opendata.brussels.be/explore/dataset/cultural-events/record/${record.record_id}` 
            : ''),
          latitude,
          longitude,
          featured: fields.featured === true || fields.highlight === true
        };
        
        return standardEvent as Event;
      });
  }
};

// Types for Brussels Open Data API responses
interface BrusselsOpenDataResponse {
  total_count: number;
  records: BrusselsOpenDataRecord[];
}

interface BrusselsOpenDataRecord {
  record_id: string;
  record_timestamp: string;
  fields: {
    title?: string;
    description?: string;
    long_description?: string;
    start_date?: string;
    end_date?: string;
    location_name?: string;
    address?: string;
    municipality?: string;
    zip_code?: string;
    url?: string;
    image_url?: string;
    thumbnail_url?: string;
    organizer?: string;
    price?: string;
    price_description?: string;
    event_type?: string;
    theme?: string;
    featured?: boolean;
    highlight?: boolean;
    latitude?: number;
    longitude?: number;
    geo_point_2d?: [number, number];
    [key: string]: any; // For other fields that might be present
  };
}