import { EventCategory } from "@shared/schema";

/**
 * Utility class for adapting different API event data to our standard format
 */
export class EventAdapter {
  /**
   * Map a category from an external source to our standard category format
   */
  static mapCategory(category: string): EventCategory {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('music') || lowerCategory.includes('concert')) {
      return 'music';
    } else if (lowerCategory.includes('art') || lowerCategory.includes('exhibition')) {
      return 'art';
    } else if (lowerCategory.includes('food') || lowerCategory.includes('drink') || lowerCategory.includes('dining')) {
      return 'food';
    } else if (lowerCategory.includes('sport') || lowerCategory.includes('fitness') || lowerCategory.includes('running')) {
      return 'sports';
    } else if (lowerCategory.includes('night') || lowerCategory.includes('party') || lowerCategory.includes('club')) {
      return 'nightlife';
    } else if (lowerCategory.includes('theater') || lowerCategory.includes('theatre') || lowerCategory.includes('performance')) {
      return 'theater';
    } else {
      // Default category
      return 'cultural';
    }
  }
  
  /**
   * Format a full address from components
   */
  static formatAddress(components: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }): string {
    const parts = [];
    
    if (components.street) parts.push(components.street);
    if (components.city) parts.push(components.city);
    
    if (components.region) {
      if (components.postalCode) {
        parts.push(`${components.postalCode} ${components.region}`);
      } else {
        parts.push(components.region);
      }
    } else if (components.postalCode) {
      parts.push(components.postalCode);
    }
    
    if (components.country) parts.push(components.country);
    
    return parts.join(', ');
  }
  
  /**
   * Convert Brussels coordinates to standard format
   * Brussels sometimes uses inverted coordinates
   */
  static normalizeBrusselsCoordinates(coords: [number, number]): [number, number] {
    // Brussels is roughly at [50.85, 4.35]
    // Check if coordinates are reversed (longitude first instead of latitude)
    if (coords[0] > 0 && coords[0] < 10 && Math.abs(coords[1]) > 40) {
      return [coords[1], coords[0]];
    }
    return coords;
  }
  
  /**
   * Calculate distance between two coordinates in kilometers
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Convert degrees to radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}