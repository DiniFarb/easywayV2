<template>
  <v-container>
    <v-row v-if="!initialLoading">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Search events..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row v-if="initialLoading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <v-row v-else-if="dataStore.error" class="mt-4">
      <v-col cols="12">
        <v-alert type="error">
          {{ dataStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="eventEntry in displayedEvents"
        :key="eventEntry._id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="event-card" elevation="2">
          <v-card-title class="text-h5">
            {{ eventEntry.event.name }}
          </v-card-title>
          <v-card-text>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-calendar</v-icon>
              <span>{{ formatDate(eventEntry.event.eventDate) }}</span>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-map-marker</v-icon>
              <span>{{ eventEntry.event.place }}</span>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-account-group</v-icon>
              <span>{{ eventEntry.event.participants.length }} Participants</span>
            </div>
            <div v-if="eventEntry.event.comments" class="mt-3">
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis">Comments:</div>
              <div>{{ eventEntry.event.comments }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="hasMore && !initialLoading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-btn
          v-if="!loadingMore"
          color="primary"
          @click="loadMore"
        >
          Load More
        </v-btn>
        <v-progress-circular
          v-else
          indeterminate
          color="primary"
          size="48"
        />
      </v-col>
    </v-row>

    <v-row v-if="!initialLoading && filteredEvents.length === 0">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-calendar-blank</v-icon>
        <p class="text-h6 mt-4 text-medium-emphasis">
          {{ searchQuery ? 'No events found matching your search' : 'No events found' }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '@/stores';

const dataStore = useDataStore();
const itemsPerPage = 12;
const currentPage = ref(1);
const initialLoading = ref(true);
const loadingMore = ref(false);
const searchQuery = ref('');
const sortBy = ref('date-desc');

const sortOptions = [
  { title: 'Date (Newest First)', value: 'date-desc' },
  { title: 'Date (Oldest First)', value: 'date-asc' },
  { title: 'Name (A-Z)', value: 'name-asc' },
  { title: 'Name (Z-A)', value: 'name-desc' },
];

const filteredEvents = computed(() => {
  let events = [...dataStore.events];

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    events = events.filter(eventEntry => {
      const name = eventEntry.event.name?.toLowerCase() || '';
      const place = eventEntry.event.place?.toLowerCase() || '';
      const comments = eventEntry.event.comments?.toLowerCase() || '';
      const eventDate = formatDate(eventEntry.event.eventDate).toLowerCase();
      const participantCount = eventEntry.event.participants.length.toString();
      const participants = eventEntry.event.participants.join(' ').toLowerCase();
      
      return name.includes(query) || 
             place.includes(query) || 
             comments.includes(query) ||
             eventDate.includes(query) ||
             participantCount.includes(query) ||
             participants.includes(query);
    });
  }

  // Sort events
  events.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.event.eventDate).getTime() - new Date(a.event.eventDate).getTime();
      case 'date-asc':
        return new Date(a.event.eventDate).getTime() - new Date(b.event.eventDate).getTime();
      case 'name-asc':
        return a.event.name.localeCompare(b.event.name);
      case 'name-desc':
        return b.event.name.localeCompare(a.event.name);
      default:
        return 0;
    }
  });

  return events;
});

const displayedEvents = computed(() => {
  return filteredEvents.value.slice(0, currentPage.value * itemsPerPage);
});

const hasMore = computed(() => {
  return displayedEvents.value.length < filteredEvents.value.length;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const loadMore = () => {
  loadingMore.value = true;
  setTimeout(() => {
    currentPage.value++;
    loadingMore.value = false;
  }, 300);
};

// Reset pagination when search or sort changes
watch([searchQuery, sortBy], () => {
  currentPage.value = 1;
});

onMounted(async () => {
  if (dataStore.events.length === 0) {
    await dataStore.fetchEvents();
  }
  initialLoading.value = false;
});
</script>

<style scoped>
.event-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
