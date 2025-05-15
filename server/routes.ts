import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get('/api/events', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const date = req.query.date as string | undefined;
      
      const events = await storage.getAllEvents();
      
      // Filter events based on query parameters
      let filteredEvents = events;
      
      if (category && category !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === category);
      }
      
      if (date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        switch (date) {
          case 'today':
            filteredEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.toDateString() === today.toDateString();
            });
            break;
          case 'tomorrow':
            filteredEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.toDateString() === tomorrow.toDateString();
            });
            break;
          case 'weekend':
            const friday = new Date(today);
            friday.setDate(today.getDate() + (5 - today.getDay()));
            const sunday = new Date(friday);
            sunday.setDate(friday.getDate() + 2);
            
            filteredEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate >= friday && eventDate <= sunday;
            });
            break;
          case 'next-week':
            const nextMonday = new Date(today);
            nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
            const nextSunday = new Date(nextMonday);
            nextSunday.setDate(nextMonday.getDate() + 6);
            
            filteredEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate >= nextMonday && eventDate <= nextSunday;
            });
            break;
        }
      }
      
      res.json(filteredEvents);
    } catch (error) {
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
          featured: event.featured
        });
      }
      
      console.log('Database initialized with mock data');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}
