<template>
  <v-container>
    <v-row v-if="!initialLoading">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Sueche..."
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
          label="Sortiere"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="$router.push({ name: 'event-add' })"
        >
          Neue Event
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else class="mb-2">
      <v-col cols="12" md="6">
        <v-skeleton-loader type="text" height="56" class="rounded" />
      </v-col>
      <v-col cols="12" md="4">
        <v-skeleton-loader type="text" height="56" class="rounded" />
      </v-col>
      <v-col cols="12" md="2">
        <v-skeleton-loader type="button" height="56" width="100%" class="rounded" />
      </v-col>
    </v-row>

    <v-row v-if="initialLoading" class="mt-4">
      <v-col
        v-for="n in 6"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >
        <v-skeleton-loader
          elevation="2"
          type="article"
        ></v-skeleton-loader>
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
        <v-card 
          class="event-card" 
          elevation="2"
          hover
          @click="$router.push({ name: 'event-edit', params: { id: eventEntry._id } })"
          style="cursor: pointer"
        >
          <v-card-title class="text-h5">
            {{ eventEntry.event.name }}
          </v-card-title>
          <v-card-text class="pt-4">
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
              <v-chip 
                :color="eventEntry.event.participants.length > 0 ? 'primary' : 'error'" 
                size="small" 
                variant="flat"
              >
                {{ eventEntry.event.participants.length }}
              </v-chip>
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
        <div ref="infiniteScrollTrigger" style="height: 1px;"></div>
        <v-progress-circular
          v-if="loadingMore"
          indeterminate
          color="primary"
          size="48"
        />
      </v-col>
    </v-row>

    <v-row v-if="!initialLoading && filteredEvents.length === 0">
      <v-col cols="12" class="text-center">
        <p class="text-h6 mt-4 text-medium-emphasis">
          {{ searchQuery ? '🤷' : 'No events found' }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDataStore } from '@/stores';
import { websocketService } from '@/services/websocketService';

const dataStore = useDataStore();
const itemsPerPage = 12;
const currentPage = ref(1);
const initialLoading = ref(true);
const loadingMore = ref(false);
const searchQuery = ref('');
const sortBy = ref('date-desc');
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const sortOptions = [
  { title: 'Datum (Neueste zersch)', value: 'date-desc' },
  { title: 'Datum (Älteste zersch)', value: 'date-asc' },
  { title: 'Name (A-Z)', value: 'name-asc' },
  { title: 'Name (Z-A)', value: 'name-desc' },
];

const filteredEvents = computed(() => {
  let events = [...dataStore.events];

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
  if (loadingMore.value || !hasMore.value) return;
  
  loadingMore.value = true;
  setTimeout(() => {
    currentPage.value++;
    loadingMore.value = false;
  }, 300);
};

const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );
  
  observer.observe(infiniteScrollTrigger.value);
};
watch([searchQuery, sortBy], () => {
  currentPage.value = 1;
});

const handleEventUpdate = async () => {
  await dataStore.fetchEvents();
};

const handleEventDelete = async () => {
  await dataStore.fetchEvents();
};

onMounted(async () => {
  if (dataStore.events.length === 0) {
    await dataStore.fetchEvents();
  }
  initialLoading.value = false;
  setTimeout(() => setupInfiniteScroll(), 100);
  websocketService.on('event:updated', handleEventUpdate);
  websocketService.on('event:deleted', handleEventDelete);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  
  websocketService.off('event:updated', handleEventUpdate);
  websocketService.off('event:deleted', handleEventDelete);
});
</script>

<style scoped>
.event-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease;
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgba(var(--v-theme-primary), 0.15) 100%);
}

.event-card:hover {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>
