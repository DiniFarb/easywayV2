import type { Person, EventEntry } from '@/types';
import { authService } from './authService';

const API_BASE_URL = 'https://wolfy.r2v.ch';

async function fetchCollection<T>(collection: string): Promise<T> {
  const token = authService.getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${API_BASE_URL}/easyway/collection`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Collection': collection,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      authService.logout();
      throw new Error('Authentication failed');
    }
    throw new Error(`Failed to fetch ${collection}`);
  }

  return response.json();
}

export const apiService = {
  async getPersons(): Promise<Person[]> {
    return fetchCollection<Person[]>('persons');
  },

  async getEvents(): Promise<EventEntry[]> {
    return fetchCollection<EventEntry[]>('events');
  },
};
