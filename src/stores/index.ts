import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PersonEntry, EventEntry } from '@/types';
import { apiService } from '@/services/apiService';
import { websocketService } from '@/services/websocketService';

export const useDataStore = defineStore('data', () => {
  const persons = ref<PersonEntry[]>([]);
  const events = ref<EventEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const wsConnected = ref(false);

  const personsCount = computed(() => persons.value.length);
  const eventsCount = computed(() => events.value.length);

  async function fetchPersons() {
    loading.value = true;
    error.value = null;
    try {
      persons.value = await apiService.getPersons();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch persons';
      console.error('Error fetching persons:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchEvents() {
    loading.value = true;
    error.value = null;
    try {
      events.value = await apiService.getEvents();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('Error fetching events:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([fetchPersons(), fetchEvents()]);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Error fetching data:', err);
    } finally {
      loading.value = false;
    }
  }

  function initWebSocket() {
    // Connect to WebSocket
    websocketService.connect();

    // Listen for persons updates
    websocketService.on('persons:updated', (data) => {
      console.log('Persons updated via WebSocket:', data);
      persons.value = data;
    });

    websocketService.on('person:added', (personEntry: PersonEntry) => {
      console.log('Person added via WebSocket:', personEntry);
      const index = persons.value.findIndex(p => p._id === personEntry._id);
      if (index === -1) {
        persons.value.push(personEntry);
      }
    });

    websocketService.on('person:updated', (personEntry: PersonEntry) => {
      console.log('Person updated via WebSocket:', personEntry);
      const index = persons.value.findIndex(p => p._id === personEntry._id);
      if (index !== -1) {
        persons.value[index] = personEntry;
      }
    });

    websocketService.on('person:deleted', (id: string) => {
      console.log('Person deleted via WebSocket:', id);
      persons.value = persons.value.filter(p => p._id !== id);
    });

    // Listen for events updates
    websocketService.on('events:updated', (data) => {
      console.log('Events updated via WebSocket:', data);
      events.value = data;
    });

    websocketService.on('event:added', (eventEntry: EventEntry) => {
      console.log('Event added via WebSocket:', eventEntry);
      const index = events.value.findIndex(e => e._id === eventEntry._id);
      if (index === -1) {
        events.value.push(eventEntry);
      }
    });

    websocketService.on('event:updated', (eventEntry: EventEntry) => {
      console.log('Event updated via WebSocket:', eventEntry);
      const index = events.value.findIndex(e => e._id === eventEntry._id);
      if (index !== -1) {
        events.value[index] = eventEntry;
      }
    });

    websocketService.on('event:deleted', (id: string) => {
      console.log('Event deleted via WebSocket:', id);
      events.value = events.value.filter(e => e._id !== id);
    });

    // Track connection status
    websocketService.on('connected', () => {
      wsConnected.value = true;
    });

    websocketService.on('disconnected', () => {
      wsConnected.value = false;
    });
  }

  function cleanupWebSocket() {
    websocketService.disconnect();
  }

  return {
    persons,
    events,
    loading,
    error,
    wsConnected,
    personsCount,
    eventsCount,
    fetchPersons,
    fetchEvents,
    fetchAll,
    initWebSocket,
    cleanupWebSocket
  };
});
