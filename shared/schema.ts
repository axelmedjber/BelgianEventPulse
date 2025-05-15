import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define event categories using an enum
export const eventCategoryEnum = z.enum([
  'music',
  'art',
  'food',
  'sports',
  'nightlife',
  'cultural',
  'theater'
]);

// Define event sources using an enum
export const eventSourceEnum = z.enum([
  'facebook',
  'eventbrite',
  'meetup',
  'brussels_open_data',
  'ticketmaster'
]);

// Define Belgian cities using an enum
export const belgianCityEnum = z.enum([
  'Brussels',
  'Antwerp',
  'Ghent',
  'Bruges',
  'Leuven',
  'Liège',
  'Namur',
  'Charleroi',
  'Mons',
  'Ostend',
  'All'
]);

// Events table definition
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  venue: text("venue"),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  organizer: text("organizer").notNull(),
  organizerImageUrl: text("organizer_image_url"),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  featured: boolean("featured").default(false),
  city: text("city"),
});

// Schema for inserting a new event
export const insertEventSchema = createInsertSchema(events).extend({
  category: eventCategoryEnum,
  source: eventSourceEnum,
  city: belgianCityEnum.optional()
});

// User's favorite events
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
});

// User schema from the original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type EventCategory = z.infer<typeof eventCategoryEnum>;
export type EventSource = z.infer<typeof eventSourceEnum>;
export type BelgianCity = z.infer<typeof belgianCityEnum>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
