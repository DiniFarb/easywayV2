import type { EventEntry, PersonEntry, Person, Event, ActivityLogEntry } from '@/types';
import { authService } from './authService';
import { API_BASE_URL } from '@/config';

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
  async getPersons(): Promise<PersonEntry[]> {
    return fetchCollection<PersonEntry[]>('persons');
  },

  async getEvents(): Promise<EventEntry[]> {
    return fetchCollection<EventEntry[]>('events');
  },

  async getActivityLog(): Promise<ActivityLogEntry[]> {
    return fetchCollection<ActivityLogEntry[]>('activity_log');
  },

  async getConstants(): Promise<{ event_types: string[] }> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/constants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to fetch constants');
    }

    return response.json();
  },

  async addPerson(person: Person): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'persons',
      },
      body: JSON.stringify({person:person}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to add person');
    }
    return response.json();
  },

  async updatePerson(id: string, person: Person): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/change/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'persons',
      },
      body: JSON.stringify({person:person}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to update person');
    }
  },

  async addEvent(event: Event): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'events',
      },
      body: JSON.stringify({event:event}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to add event');
    }
    //get body from response
    return response.json(); 
  },

  async updateEvent(id: string, event: Event): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/change/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'events',
      },
      body: JSON.stringify({event:event}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to update event');
    }
  },

  async deletePerson(id: string): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'persons',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to delete person');
    }
  },

  async deleteEvent(id: string): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/easyway/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Collection': 'events',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to delete event');
    }
  },
};
