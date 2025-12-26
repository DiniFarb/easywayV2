import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Person, EventEntry } from '@/types';
import { apiService } from '@/services/apiService';

export const useDataStore = defineStore('data', () => {
  const persons = ref<Person[]>([]);
  const events = ref<EventEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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

  return {
    persons,
    events,
    loading,
    error,
    personsCount,
    eventsCount,
    fetchPersons,
    fetchEvents,
    fetchAll,
  };
});
