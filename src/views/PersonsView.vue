<template>
  <v-container>
    <!-- Row 1: Dummy Switch, Add and Export Buttons -->
    <v-row v-if="!initialLoading" align="center" justify="center" class="mb-2">
      <v-col cols="auto">
        <v-switch
          v-model="hideDummies"
          label="Hide Dummies"
          color="primary"
          hide-details
          density="comfortable"
          inset
        />
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="$router.push({ name: 'person-add' })"
        >
          Add New
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="secondary"
          prepend-icon="mdi-download"
          @click="exportDialog = true"
        >
          Export
        </v-btn>
      </v-col>
    </v-row>

    <!-- Row 2: Search and Sort -->
    <v-row v-if="!initialLoading" align="center" class="mb-2">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Search persons..."
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

    <!-- Export Dialog -->
    <v-dialog v-model="exportDialog" max-width="900">
      <v-card>
        <v-card-title class="text-h5 d-flex justify-space-between align-center">
          <span>Export Persons</span>
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="selectedEventTypes = []"
          >
            Clear All
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="eventType in eventTypes"
              :key="eventType"
              cols="12"
              sm="6"
              md="4"
            >
              <v-checkbox
                v-model="selectedEventTypes"
                :value="eventType"
                :label="eventType"
                color="primary"
                hide-details
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="exportDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="exporting"
            :disabled="selectedEventTypes.length === 0"
            @click="handleExport"
          >
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
        v-for="personEntry in displayedPersons"
        :key="personEntry._id"
        cols="12"
        md="6"
        lg="3"
      >
        <v-card 
          class="person-card" 
          elevation="2"
          hover
          @click="$router.push({ name: 'person-edit', params: { id: personEntry._id } })"
          style="cursor: pointer; position: relative;"
        >
          <v-icon 
            :icon="getGenderIcon(personEntry.person.gender)" 
            size="small" 
            style="position: absolute; top: 12px; right: 12px;"
          />
          <v-card-title class="text-h10">
            {{ personEntry.person.firstname }} {{ personEntry.person.lastname }}
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-cake-variant</v-icon>
              <span v-if="personEntry.person.birthdate">{{ formatDate(personEntry.person.birthdate) }} ({{ calculateAge(personEntry.person.birthdate) }}y)</span>
              <v-chip v-else color="error" size="small" variant="flat">missing</v-chip>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-map-marker</v-icon>
              <span v-if="personEntry.person.city">{{ personEntry.person.city }}</span>
              <v-chip v-else color="error" size="small" variant="flat">missing</v-chip>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-phone</v-icon>
              <span v-if="personEntry.person.phone">{{ personEntry.person.phone }}</span>
              <v-chip v-else color="error" size="small" variant="flat">missing</v-chip>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-phone-alert</v-icon>
              <span v-if="personEntry.person.emergency_phone">{{ personEntry.person.emergency_phone }}</span>
              <v-chip v-else color="error" size="small" variant="flat">missing</v-chip>
            </div>
            <div class="mb-2">
              <v-icon class="mr-2" size="small">mdi-calendar-multiple</v-icon>
              <v-chip 
                :color="getEventCount(personEntry._id) > 0 ? 'primary' : 'error'" 
                size="small" 
                variant="flat"
              >
                {{ getEventCount(personEntry._id) }}
              </v-chip>
            </div>
            <div v-if="personEntry.person.comments" class="mt-3">
              <v-divider class="mb-2" />
              <div class="text-caption text-medium-emphasis">Comments:</div>
              <div>{{ personEntry.person.comments }}</div>
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

    <v-row v-if="!initialLoading && filteredPersons.length === 0">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-account-group</v-icon>
        <p class="text-h6 mt-4 text-medium-emphasis">
          {{ searchQuery ? 'No persons found matching your search' : 'No persons found' }}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useDataStore } from '@/stores';
import { apiService } from '@/services/apiService';
import { exportService } from '@/services/exportService';
import { websocketService } from '@/services/websocketService';

const dataStore = useDataStore();
const itemsPerPage = 12;
const currentPage = ref(1);
const initialLoading = ref(true);
const loadingMore = ref(false);
const searchQuery = ref('');
const sortBy = ref('name-asc');
const hideDummies = ref(true);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const exportDialog = ref(false);
const selectedEventTypes = ref<string[]>([]);
const eventTypes = ref<string[]>([]);
const exporting = ref(false);
let observer: IntersectionObserver | null = null;

const sortOptions = [
  { title: 'Name (A-Z)', value: 'name-asc' },
  { title: 'Name (Z-A)', value: 'name-desc' },
  { title: 'Age (Youngest First)', value: 'age-asc' },
  { title: 'Age (Oldest First)', value: 'age-desc' },
  { title: 'City (A-Z)', value: 'city-asc' },
  { title: 'City (Z-A)', value: 'city-desc' },
];

const filteredPersons = computed(() => {
  let persons = [...dataStore.persons];

  // Filter out dummies if switch is enabled
  if (hideDummies.value) {
    persons = persons.filter(personEntry => 
      !personEntry.person.firstname?.startsWith('#DUMMY')
    );
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    persons = persons.filter(personEntry => {
      const firstname = personEntry.person.firstname?.toLowerCase() || '';
      const lastname = personEntry.person.lastname?.toLowerCase() || '';
      const city = personEntry.person.city?.toLowerCase() || '';
      const phone = personEntry.person.phone?.toLowerCase() || '';
      const emergencyPhone = personEntry.person.emergency_phone?.toLowerCase() || '';
      const gender = personEntry.person.gender?.toLowerCase() || '';
      const comments = personEntry.person.comments?.toLowerCase() || '';
      const age = personEntry.person.birthdate ? calculateAge(personEntry.person.birthdate).toString() : '';
      const fullName = `${firstname} ${lastname}`;
      
      return firstname.includes(query) || 
             lastname.includes(query) || 
             fullName.includes(query) ||
             city.includes(query) || 
             phone.includes(query) ||
             emergencyPhone.includes(query) ||
             gender.includes(query) ||
             comments.includes(query) ||
             age.includes(query);
    });
  }

  // Sort persons
  persons.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        const nameA = `${a.person.firstname} ${a.person.lastname}`;
        const nameB = `${b.person.firstname} ${b.person.lastname}`;
        return nameA.localeCompare(nameB);
      case 'name-desc':
        const nameDescA = `${a.person.firstname} ${a.person.lastname}`;
        const nameDescB = `${b.person.firstname} ${b.person.lastname}`;
        return nameDescB.localeCompare(nameDescA);
      case 'age-asc':
        return calculateAge(a.person.birthdate) - calculateAge(b.person.birthdate);
      case 'age-desc':
        return calculateAge(b.person.birthdate) - calculateAge(a.person.birthdate);
      case 'city-asc':
        return a.person.city.localeCompare(b.person.city);
      case 'city-desc':
        return b.person.city.localeCompare(a.person.city);
      default:
        return 0;
    }
  });

  return persons;
});

const displayedPersons = computed(() => {
  return filteredPersons.value.slice(0, currentPage.value * itemsPerPage);
});

const hasMore = computed(() => {
  return displayedPersons.value.length < filteredPersons.value.length;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const calculateAge = (birthdate: string) => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const getEventCount = (personId: string) => {
  return dataStore.events.filter(eventEntry => 
    eventEntry.event.participants.includes(personId)
  ).length;
};

const getGenderIcon = (gender: string) => {
  switch (gender?.toLowerCase()) {
    case 'm':
    case 'male':
    case 'männlich':
      return 'mdi-gender-male';
    case 'w':
    case 'f':
    case 'female':
    case 'weiblich':
      return 'mdi-gender-female';
    default:
      return 'mdi-gender-male-female';
  }
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
  // Disconnect existing observer if any
  if (observer) {
    observer.disconnect();
  }
  
  // Wait for next tick to ensure element is rendered
  nextTick(() => {
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
  });
};

const handleExport = async () => {
  if (selectedEventTypes.value.length === 0) return;
  
  exporting.value = true;
  try {
    await exportService.exportPersons(selectedEventTypes.value);
    exportDialog.value = false;
    selectedEventTypes.value = [];
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    exporting.value = false;
  }
};

// Reset pagination when search or sort changes
watch([searchQuery, sortBy, hideDummies], () => {
  currentPage.value = 1;
  // Re-setup infinite scroll after content changes
  nextTick(() => setupInfiniteScroll());
});

const handlePersonUpdate = async () => {
  // Refresh persons when a person is updated or added
  await dataStore.fetchPersons();
};

const handlePersonDelete = async () => {
  // Refresh persons when a person is deleted
  await dataStore.fetchPersons();
};

const handleEventUpdate = async () => {
  // Refresh events when an event is updated (affects participant count)
  await dataStore.fetchEvents();
};

onMounted(async () => {
  if (dataStore.persons.length === 0 || dataStore.events.length === 0) {
    await dataStore.fetchAll();
  }
  initialLoading.value = false;
  
  // Fetch event types from constants
  try {
    const constants = await apiService.getConstants();
    if (constants.event_types) {
      eventTypes.value = constants.event_types;
    }
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }
  
  // Setup infinite scroll after initial load
  setupInfiniteScroll();
  
  // Setup WebSocket listeners for real-time updates
  websocketService.on('person:updated', handlePersonUpdate);
  websocketService.on('person:deleted', handlePersonDelete);
  websocketService.on('event:updated', handleEventUpdate);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  
  // Remove WebSocket listeners
  websocketService.off('person:updated', handlePersonUpdate);
  websocketService.off('person:deleted', handlePersonDelete);
  websocketService.off('event:updated', handleEventUpdate);
});
</script>

<style scoped>
.person-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease;
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgba(var(--v-theme-primary), 0.15) 100%);
}

.person-card:hover {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>