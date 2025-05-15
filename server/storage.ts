import { 
  users, 
  type User, 
  type InsertUser, 
  events, 
  type Event, 
  type InsertEvent, 
  userFavorites, 
  type UserFavorite 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  getUserFavorites(userId: number): Promise<Event[]>;
  addUserFavorite(userId: number, eventId: number): Promise<UserFavorite>;
  removeUserFavorite(userId: number, eventId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private favorites: Map<number, UserFavorite>;
  private userId: number;
  private eventId: number;
  private favoriteId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.favorites = new Map();
    this.userId = 1;
    this.eventId = 1;
    this.favoriteId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    // Handle nullable fields properly
    const event: Event = { 
      ...insertEvent, 
      id,
      longDescription: insertEvent.longDescription || null,
      endDate: insertEvent.endDate || null,
      venue: insertEvent.venue || null,
      organizerImageUrl: insertEvent.organizerImageUrl || null,
      sourceUrl: insertEvent.sourceUrl || '',
      featured: insertEvent.featured || false,
      city: insertEvent.city || null
    };
    this.events.set(id, event);
    return event;
  }

  // UserFavorite methods
  async getUserFavorites(userId: number): Promise<Event[]> {
    const userFavoritesIds = Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .map(favorite => favorite.eventId);
    
    return Array.from(this.events.values())
      .filter(event => userFavoritesIds.includes(event.id));
  }

  async addUserFavorite(userId: number, eventId: number): Promise<UserFavorite> {
    // Check if user and event exist
    const user = await this.getUser(userId);
    const event = await this.getEventById(eventId);
    
    if (!user || !event) {
      throw new Error('User or event not found');
    }
    
    // Check if favorite already exists
    const existingFavorite = Array.from(this.favorites.values())
      .find(fav => fav.userId === userId && fav.eventId === eventId);
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    // Create new favorite
    const id = this.favoriteId++;
    const favorite: UserFavorite = { id, userId, eventId };
    this.favorites.set(id, favorite);
    
    return favorite;
  }

  async removeUserFavorite(userId: number, eventId: number): Promise<boolean> {
    const favoriteToRemove = Array.from(this.favorites.values())
      .find(fav => fav.userId === userId && fav.eventId === eventId);
    
    if (!favoriteToRemove) {
      return false;
    }
    
    return this.favorites.delete(favoriteToRemove.id);
  }
}

export const storage = new MemStorage();
