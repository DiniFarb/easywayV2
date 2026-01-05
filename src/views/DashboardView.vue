<template>
  <v-container>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <!-- Year Filter Row -->
            <v-row>
              <v-col cols="12" class="text-center">
                <v-chip-group v-model="selectedYears" multiple>
                  <v-chip
                    v-for="year in availableYears"
                    :key="year"
                    :value="year"
                    filter
                    variant="outlined"
                    color="primary"
                  >
                    {{ year }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>

            <!-- Event Name Filter Row -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-select
                  v-model="selectedEventNames"
                  :items="availableEventNames"
                  label="Filter by Event Type"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="compact"
                  color="primary"
                  hide-details
                />
              </v-col>
            </v-row>

            <!-- Counts Row -->
            <v-row v-if="!dataStore.loading && !dataStore.error" class="mt-4">
              <v-col cols="12" md="6" class="text-center">
                <div class="text-h3">{{ filteredPersonsCount }}</div>
                <div class="text-subtitle-1 text-medium-emphasis">
                  <v-icon class="mr-2" size="small">mdi-account-group</v-icon>
                  Visits
                </div>
              </v-col>
              <v-col cols="12" md="6" class="text-center">
                <div class="text-h3">{{ filteredEventsCount }}</div>
                <div class="text-subtitle-1 text-medium-emphasis">
                  <v-icon class="mr-2" size="small">mdi-calendar</v-icon>
                  Events
                </div>
              </v-col>
            </v-row>

            <!-- Loading State -->
            <v-row v-if="dataStore.loading">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" />
              </v-col>
            </v-row>

            <!-- Error State -->
            <v-row v-if="dataStore.error">
              <v-col cols="12" class="text-center text-error">
                {{ dataStore.error }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gender Distribution Card -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div v-if="!dataStore.loading && !dataStore.error && filteredPersonsCount > 0">
              <div class="text-h6 text-center mb-4">Gender Distribution</div>
              <v-row>
                <v-col cols="12" md="6" class="d-flex justify-center">
                  <svg :width="300" :height="300" viewBox="0 0 300 300">
                    <g transform="translate(150, 150)">
                      <path
                        v-for="(slice, index) in genderSlices"
                        :key="index"
                        :d="slice.path"
                        :fill="slice.color"
                        :stroke="'white'"
                        :stroke-width="2"
                      />
                    </g>
                  </svg>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center justify-center">
                  <div class="d-flex flex-column gap-2">
                    <div v-for="(stat, index) in genderStats" :key="index" class="d-flex align-center">
                      <div
                        :style="{ width: '15px', height: '15px', backgroundColor: stat.color, marginRight: '16px', borderRadius: '4px' }"
                      ></div>
                      <span>{{ stat.label }}: {{ stat.count }} ({{ stat.percentage }}%)</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
            <div v-else-if="!dataStore.loading && filteredPersonsCount === 0" class="text-center text-medium-emphasis">
              No data to display
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div v-if="!dataStore.loading && !dataStore.error && filteredEventsCount > 0">
              <div class="text-h6 text-center mb-4">Participant Cities Distribution</div>
              <v-row>
                <v-col cols="12" md="6" class="d-flex justify-center">
                  <svg :width="300" :height="300" viewBox="0 0 300 300">
                    <g transform="translate(150, 150)">
                      <path
                        v-for="(slice, index) in placeSlices"
                        :key="index"
                        :d="slice.path"
                        :fill="slice.color"
                        :stroke="'white'"
                        :stroke-width="2"
                      />
                    </g>
                  </svg>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center justify-center">
                  <div class="d-flex flex-column gap-8">
                    <div v-for="(stat, index) in placeStats" :key="index" class="d-flex align-center">
                      <div
                        :style="{ width: '15px', height: '15px', backgroundColor: stat.color, marginRight: '16px', borderRadius: '4px' }"
                      ></div>
                      <span>{{ stat.label }}: {{ stat.count }} ({{ stat.percentage }}%)</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
            <div v-else-if="!dataStore.loading && filteredEventsCount === 0" class="text-center text-medium-emphasis">
              No data to display
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Export Button Row -->
    <v-row class="mt-4">
      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="handleExport"
          :disabled="dataStore.loading || selectedYears.length === 0 || selectedEventNames.length === 0"
        >
          Export Statistics
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '@/stores';
import { exportService } from '@/services/exportService';

const dataStore = useDataStore();
const selectedYears = ref<number[]>([]);
const selectedEventNames = ref<string[]>([]);
const isExporting = ref(false);

const handleExport = async () => {
  if (isExporting.value) return;
  
  try {
    isExporting.value = true;
    await exportService.exportStatistics(
      selectedEventNames.value,
      selectedYears.value
    );
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    isExporting.value = false;
  }
};

// Get unique event names from events (filtered by selected years)
const availableEventNames = computed(() => {
  const names = new Set<string>();
  
  // Only show event names if years are selected
  if (selectedYears.value.length === 0) {
    return [];
  }
  
  // Filter events by selected years
  const eventsToConsider = dataStore.events.filter(eventEntry => {
    if (eventEntry.event.eventDate) {
      const year = new Date(eventEntry.event.eventDate).getFullYear();
      return selectedYears.value.includes(year);
    }
    return false;
  });
  
  // Get unique event names from the filtered events
  eventsToConsider.forEach(eventEntry => {
    if (eventEntry.event.name) {
      names.add(eventEntry.event.name);
    }
  });
  
  return Array.from(names).sort();
});

// Get unique years from events
const availableYears = computed(() => {
  const years = new Set<number>();
  dataStore.events.forEach(eventEntry => {
    if (eventEntry.event.eventDate) {
      const year = new Date(eventEntry.event.eventDate).getFullYear();
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => a - b); // Sort ascending (lowest to highest)
});

// Filter events based on selected years and event names
const getFilteredEvents = () => {
  return dataStore.events.filter(eventEntry => {
    // Filter by year
    const yearMatch = selectedYears.value.length === 0 || (() => {
      if (eventEntry.event.eventDate) {
        const year = new Date(eventEntry.event.eventDate).getFullYear();
        return selectedYears.value.includes(year);
      }
      return false;
    })();

    // Filter by event name
    const nameMatch = selectedEventNames.value.length === 0 || 
      selectedEventNames.value.includes(eventEntry.event.name);

    return yearMatch && nameMatch;
  });
};

// Count events filtered by selected years and event names
const filteredEventsCount = computed(() => {
  return getFilteredEvents().length;
});

// Count persons that participate in filtered events
const filteredPersonsCount = computed(() => {
  const filteredEvents = getFilteredEvents();
  return filteredEvents.reduce((a,c) => a += c.event.participants.length, 0);
});

// Calculate gender distribution from filtered persons
const genderStats = computed(() => {
  const filteredEvents = getFilteredEvents();
  
  // Collect unique participant IDs from filtered events
  const participantIds = new Set<string>();
  filteredEvents.forEach(eventEntry => {
    eventEntry.event.participants.forEach(participantId => {
      participantIds.add(participantId);
    });
  });
  
  // Count genders
  const genderCounts = { M: 0, W: 0, O: 0 };
  dataStore.persons.forEach(personEntry => {
    if (participantIds.has(personEntry._id)) {
      const gender = personEntry.person.gender?.toUpperCase() || 'O';
      if (gender === 'M' || gender === 'MALE' || gender === 'MÄNNLICH') {
        genderCounts.M++;
      } else if (gender === 'W' || gender === 'F' || gender === 'FEMALE' || gender === 'WEIBLICH') {
        genderCounts.W++;
      } else {
        genderCounts.O++;
      }
    }
  });
  
  const total = genderCounts.M + genderCounts.W + genderCounts.O;
  
  return [
    {
      label: 'Male',
      count: genderCounts.M,
      percentage: total > 0 ? ((genderCounts.M / total) * 100).toFixed(1) : 0,
      color: '#d12662'
    },
    {
      label: 'Female',
      count: genderCounts.W,
      percentage: total > 0 ? ((genderCounts.W / total) * 100).toFixed(1) : 0,
      color: '#e6739b'
    },
    {
      label: 'Other',
      count: genderCounts.O,
      percentage: total > 0 ? ((genderCounts.O / total) * 100).toFixed(1) : 0,
      color: '#f4a6c1'
    }
  ].filter(stat => stat.count > 0);
});

// Calculate place distribution from filtered events
const placeStats = computed(() => {
  const filteredEvents = getFilteredEvents();
  
  // Collect unique participant IDs from filtered events
  const participantIds = new Set<string>();
  filteredEvents.forEach(eventEntry => {
    eventEntry.event.participants.forEach(participantId => {
      participantIds.add(participantId);
    });
  });
  
  // Count cities from participants
  const cityCounts: { [key: string]: number } = {};
  dataStore.persons.forEach(personEntry => {
    if (participantIds.has(personEntry._id)) {
      const city = personEntry.person.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
  });
  
  const total = Object.values(cityCounts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];
  
  const colors = [
    '#d12662', '#d84075', '#df5a88', '#e6739b', '#ed8dae',
    '#f4a6c1', '#f1b3ca', '#eec0d3', '#ebcddc', '#e8dae5'
  ];
  
  return Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([place, count], index) => ({
      label: place,
      count,
      percentage: ((count / total) * 100).toFixed(1),
      color: colors[index % colors.length]
    }));
});

// Create pie chart slices
const genderSlices = computed(() => {
  const stats = genderStats.value;
  if (stats.length === 0) return [];
  
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);
  let currentAngle = -Math.PI / 2; // Start at top
  
  return stats.map(stat => {
    const percentage = stat.count / total;
    const angle = percentage * 2 * Math.PI;
    const endAngle = currentAngle + angle;
    
    const x1 = Math.cos(currentAngle) * 120;
    const y1 = Math.sin(currentAngle) * 120;
    const x2 = Math.cos(endAngle) * 120;
    const y2 = Math.sin(endAngle) * 120;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      path,
      color: stat.color
    };
  });
});

// Create pie chart slices for places
const placeSlices = computed(() => {
  const stats = placeStats.value;
  if (stats.length === 0) return [];
  
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);
  let currentAngle = -Math.PI / 2; // Start at top
  
  return stats.map(stat => {
    const percentage = stat.count / total;
    const angle = percentage * 2 * Math.PI;
    const endAngle = currentAngle + angle;
    
    const x1 = Math.cos(currentAngle) * 120;
    const y1 = Math.sin(currentAngle) * 120;
    const x2 = Math.cos(endAngle) * 120;
    const y2 = Math.sin(endAngle) * 120;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      path,
      color: stat.color
    };
  });
});

onMounted(async () => {
  await dataStore.fetchAll();
  // Select only the current year by default
  const currentYear = new Date().getFullYear();
  selectedYears.value = availableYears.value.includes(currentYear) ? [currentYear] : [];
  selectedEventNames.value = [...availableEventNames.value];
});

// Watch for year changes and update selectedEventNames to only include available ones
watch(availableEventNames, (newEventNames) => {
  // Filter selectedEventNames to only include ones that are still available
  selectedEventNames.value = selectedEventNames.value.filter(name => 
    newEventNames.includes(name)
  );
});
</script>
