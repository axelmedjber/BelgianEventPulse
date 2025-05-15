import { Event } from "@shared/schema";
import { EventAdapter } from "../utils/event-adapter";
import { log } from "../../vite";

/**
 * Brussels Open Data Portal API provider
 */
export const brusselsOpenData = {
  /**
   * Fetches events from Brussels Open Data Portal
   * @returns Array of normalized events
   */
  async fetchEvents(): Promise<Event[]> {
    try {
      // Check if API key is configured (not required but helpful for higher rate limits)
      const apiKey = process.env.BRUSSELS_OPEN_DATA_API_KEY;
      if (!apiKey) {
        log('Brussels Open Data API key not found in environment variables', 'api-config');
      }
      
      // Generate date range for the query (today to one week from now)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const nextWeekStr = nextWeek.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Construct the API URL with proper query parameters
      // Fix the ODSQL syntax by removing the SELECT * part
      const apiUrl = new URL('https://opendata.brussels.be/api/v2/catalog/datasets/cultural-events/records');
      apiUrl.searchParams.append('where', `start_date >= '${todayStr}' AND start_date <= '${nextWeekStr}'`);
      apiUrl.searchParams.append('limit', '100');
      apiUrl.searchParams.append('timezone', 'Europe/Brussels');
      
      if (apiKey) {
        apiUrl.searchParams.append('apikey', apiKey);
      }
      
      log(`GET ${apiUrl.toString()}`, 'api-client');
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData, null, 2)}`);
      }
      
      const data: BrusselsOpenDataResponse = await response.json();
      
      if (!data.records || !Array.isArray(data.records)) {
        return [];
      }
      
      log(`Retrieved ${data.records.length} events from Brussels Open Data API`, 'brussels-api');
      return this.processEvents(data.records);
    } catch (error) {
      log(`Error fetching Brussels Open Data events: ${error instanceof Error ? error.message : String(error)}`, 'brussels-api');
      return [];
    }
  },
  
  /**
   * Process raw Brussels Open Data events into normalized format
   * @param events Raw Brussels Open Data event records
   * @returns Normalized events
   */
  processEvents(events: BrusselsOpenDataRecord[]): Event[] {
    return events.filter(record => !!record.fields?.title).map(record => {
      const fields = record.fields;
      
      // Extract location data
      let location = 'Brussels, Belgium';
      let latitude = 50.85045;
      let longitude = 4.34878;
      
      const addressParts = [];
      if (fields.address) addressParts.push(fields.address);
      if (fields.municipality) addressParts.push(fields.municipality);
      if (fields.zip_code) addressParts.push(fields.zip_code);
      
      if (addressParts.length > 0) {
        location = addressParts.join(', ');
      }
      
      // Extract coordinates
      if (fields.geo_point_2d && Array.isArray(fields.geo_point_2d) && fields.geo_point_2d.length === 2) {
        const normalizedCoords = EventAdapter.normalizeBrusselsCoordinates(fields.geo_point_2d);
        latitude = normalizedCoords[0];
        longitude = normalizedCoords[1];
      } else if (fields.latitude !== undefined && fields.longitude !== undefined) {
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
        imageUrl: fields.image_url || fields.thumbnail_url || 'https://via.placeholder.com/400x200?text=Brussels+Event',
        organizer: fields.organizer || 'Brussels Open Data',
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