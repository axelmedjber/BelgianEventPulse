import { facebook } from './providers/facebook';
import { eventbrite } from './providers/eventbrite';
import { meetup } from './providers/meetup';
import { brusselsOpenData } from './providers/brussels-open-data';
import { ticketmaster } from './providers/ticketmaster';
import { Event } from '../../shared/schema';
import { log } from '../vite';

/**
 * Fetches events from all configured API providers
 * @returns {Promise<Event[]>} Normalized events from all providers
 */
export async function fetchAllEvents(): Promise<Event[]> {
  log('Fetching events from all providers...', 'api');
  
  try {
    // Run all API fetches in parallel
    const results = await Promise.allSettled([
      facebook.fetchEvents(),
      eventbrite.fetchEvents(),
      meetup.fetchEvents(),
      brusselsOpenData.fetchEvents(),
      ticketmaster.fetchEvents()
    ]);
    
    // Combine and flatten all successful responses
    const events = results
      .filter((result): result is PromiseFulfilledResult<Event[]> => 
        result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    // Log any failed providers
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const providers = ['Facebook', 'Eventbrite', 'Meetup', 'Brussels Open Data', 'Ticketmaster'];
        log(`Error fetching from ${providers[index]}: ${result.reason}`, 'api');
      }
    });
    
    log(`Fetched ${events.length} total events from all providers`, 'api');
    return events;
  } catch (error) {
    log(`Error fetching events: ${error instanceof Error ? error.message : String(error)}`, 'api');
    throw error;
  }
}