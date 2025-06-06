export type EventCategory = 'music' | 'art' | 'food' | 'sports' | 'nightlife' | 'cultural' | 'theater';

export type EventSource = 'facebook' | 'eventbrite' | 'meetup' | 'brussels_open_data' | 'ticketmaster';

export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  date: string;
  endDate?: string;
  location: string;
  venue?: string;
  category: EventCategory;
  imageUrl: string;
  organizer: string;
  organizerImageUrl?: string;
  source: EventSource;
  sourceUrl?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  featured?: boolean;
  city?: BelgianCity;
}

export type BelgianCity = 'Brussels' | 'Antwerp' | 'Ghent' | 'Bruges' | 'Leuven' | 'Liège' | 'Namur' | 'Charleroi' | 'Mons' | 'Ostend' | 'All';

export interface EventFilter {
  category?: EventCategory | 'all';
  date?: string;
  location?: string;
  city?: BelgianCity;
}

export interface Coordinate {
  lat: number;
  lng: number;
}
