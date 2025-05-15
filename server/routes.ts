import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, type Event } from "@shared/schema";
import { z } from "zod";
import { fetchAllEvents } from "./api/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events - from both storage and external API providers
  app.get('/api/events', async (req, res) => {
    try {
      // Get events from storage
      const storageEvents = await storage.getAllEvents();
      
      // Try to fetch events from external APIs
      let apiEvents: Event[] = [];
      try {
        apiEvents = await fetchAllEvents();
        
        // If we got API events, store them for future use
        if (apiEvents.length > 0) {
          for (const event of apiEvents) {
            try {
              // Convert to insert format and add to storage
              // Skip events that are already in storage (using sourceUrl as unique identifier)
              const existingEvents = storageEvents.filter(e => 
                e.sourceUrl === event.sourceUrl && e.source === event.source);
              
              if (existingEvents.length === 0) {
                await storage.createEvent({
                  title: event.title,
                  description: event.description || '',
                  longDescription: event.longDescription,
                  date: new Date(event.date),
                  endDate: event.endDate || null,
                  location: event.location,
                  venue: event.venue,
                  // Ensure category is one of the allowed enum values
                  category: (event.category as any),
                  imageUrl: event.imageUrl,
                  organizer: event.organizer,
                  organizerImageUrl: event.organizerImageUrl,
                  // Ensure source is one of the allowed enum values
                  source: (event.source as any),
                  sourceUrl: event.sourceUrl || '',
                  latitude: event.latitude,
                  longitude: event.longitude,
                  featured: event.featured || false,
                  city: event.city || 'Brussels'
                });
              }
            } catch (err) {
              console.error('Error saving API event to storage:', err);
            }
          }
        }
      } catch (apiError) {
        console.error('Error fetching from APIs:', apiError);
        // Continue with storage events if API fetch fails
      }
      
      // Combine events from storage (which now includes newly saved API events)
      // Re-fetch to get events with IDs
      const allEvents = await storage.getAllEvents();
      
      // Filter to show only today's events
      const today = new Date();
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
      });
      
      res.json(filteredEvents);
    } catch (error) {
      console.error('Error in events endpoint:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  });

  // Get event by ID
  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching event' });
    }
  });

  // Create new event
  app.post('/api/events', async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid event data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating event' });
    }
  });

  // Initialize with mock data for development
  if (process.env.NODE_ENV === 'development') {
    initializeWithMockData();
  }

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to initialize database with mock data
async function initializeWithMockData() {
  try {
    const events = await storage.getAllEvents();
    
    // Only seed if no events exist
    if (events.length === 0) {
      // Import mock data generation function
      const { generateMockEvents } = await import('../client/src/lib/mockData');
      const mockEvents = generateMockEvents();
      
      // Insert mock events
      for (const event of mockEvents) {
        await storage.createEvent({
          title: event.title,
          description: event.description,
          longDescription: event.longDescription,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          location: event.location,
          venue: event.venue,
          category: event.category,
          imageUrl: event.imageUrl,
          organizer: event.organizer,
          organizerImageUrl: event.organizerImageUrl,
          source: event.source,
          sourceUrl: event.sourceUrl,
          latitude: event.latitude,
          longitude: event.longitude,
          featured: event.featured,
          city: event.city
        });
      }
      
      console.log('Database initialized with mock data');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}
