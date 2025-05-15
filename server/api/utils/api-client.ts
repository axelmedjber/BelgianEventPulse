import { log } from '../../vite';

/**
 * Options for the API request
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
  timeout?: number;
}

/**
 * Handles HTTP API requests with standardized error handling
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  
  /**
   * Creates a new API client
   * @param baseUrl - The base URL for the API
   * @param defaultHeaders - Default headers to include in all requests
   */
  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }
  
  /**
   * Makes an API request
   * @param endpoint - API endpoint (will be appended to the base URL)
   * @param options - Request options
   * @returns The parsed JSON response
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      params = {},
      body,
      timeout = 30000
    } = options;
    
    // Build URL with query parameters
    const url = new URL(
      endpoint.startsWith('/') ? `${this.baseUrl}${endpoint}` : `${this.baseUrl}/${endpoint}`
    );
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
    
    // Setup fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers
      }
    };
    
    // Add request body if present
    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;
    
    try {
      log(`${method} ${url.toString()}`, 'api-client');
      
      const response = await fetch(url.toString(), fetchOptions);
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error (${response.status}): ${errorData}`);
      }
      
      // Parse and return JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms: ${url.toString()}`);
      }
      throw error;
    }
  }
  
  /**
   * Makes a GET request
   */
  async get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  /**
   * Makes a POST request
   */
  async post<T>(endpoint: string, body: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }
}