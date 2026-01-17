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

    <!-- Average Visitors per Week Chart -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <div v-if="!dataStore.loading && !dataStore.error && weeklyStats.length > 0">
              <div class="text-h6 text-center mb-4">Average Visitors per Week</div>
              <v-row>
                <v-col cols="12" class="d-flex justify-center">
                  <svg :width="800" :height="400" viewBox="0 0 800 400" style="max-width: 100%; height: auto;">
                    <!-- Grid lines -->
                    <g>
                      <line v-for="i in 5" :key="'grid-' + i"
                        :x1="60" :x2="760"
                        :y1="50 + (i - 1) * 70" :y2="50 + (i - 1) * 70"
                        stroke="#e0e0e0" stroke-width="1" />
                    </g>
                    
                    <!-- Y-axis labels -->
                    <g>
                      <text v-for="i in 5" :key="'y-label-' + i"
                        :x="50" :y="54 + (5 - i) * 70"
                        text-anchor="end" font-size="12" fill="#666">
                        {{ Math.round(maxWeeklyVisitors * (i - 1) / 4) }}
                      </text>
                    </g>
                    
                    <!-- Line Chart -->
                    <g>
                      <!-- Area under the line -->
                      <path
                        :d="lineAreaPath"
                        fill="#d12662"
                        opacity="0.2" />
                      
                      <!-- Line -->
                      <path
                        :d="linePath"
                        fill="none"
                        stroke="#d12662"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                      
                      <!-- Data points -->
                      <circle v-for="(week, index) in weeklyStats" :key="'point-' + index"
                        :cx="60 + index * pointSpacing + pointSpacing / 2"
                        :cy="330 - (week.visitors / (maxWeeklyVisitors || 1)) * 280"
                        r="5"
                        fill="#d12662"
                        stroke="white"
                        stroke-width="2" />
                      
                      <!-- Data labels (visitor count) -->
                      <text v-for="(week, index) in weeklyStats" :key="'label-' + index"
                        :x="60 + index * pointSpacing + pointSpacing / 2"
                        :y="320 - (week.visitors / (maxWeeklyVisitors || 1)) * 280"
                        text-anchor="middle" font-size="12" font-weight="bold" fill="#333">
                        {{ week.visitors }}
                      </text>
                    </g>
                    
                    <!-- X-axis -->
                    <line x1="60" y1="330" x2="760" y2="330" stroke="#333" stroke-width="2" />
                    
                    <!-- X-axis labels -->
                    <g>
                      <text v-for="(week, index) in weeklyStats" :key="'x-label-' + index"
                        :x="60 + index * pointSpacing + pointSpacing / 2"
                        y="350"
                        text-anchor="middle" font-size="11" fill="#666">
                        W{{ week.weekNumber }}
                      </text>
                      <text v-for="(week, index) in weeklyStats" :key="'x-year-' + index"
                        :x="60 + index * pointSpacing + pointSpacing / 2"
                        y="365"
                        text-anchor="middle" font-size="9" fill="#999">
                        {{ week.year }}
                      </text>
                    </g>
                    
                    <!-- Y-axis -->
                    <line x1="60" y1="50" x2="60" y2="330" stroke="#333" stroke-width="2" />
                    
                    <!-- Axis labels -->
                    <text x="400" y="390" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">
                      Week
                    </text>
                    <text x="20" y="190" text-anchor="middle" font-size="14" font-weight="bold" fill="#333"
                      transform="rotate(-90, 20, 190)">
                      Visitors
                    </text>
                  </svg>
                </v-col>
              </v-row>
              <div class="text-center mt-4">
                <v-chip color="primary" variant="outlined">
                  Average: {{ averageVisitorsPerWeek }} visitors/week
                </v-chip>
              </div>
            </div>
            <div v-else-if="!dataStore.loading && weeklyStats.length === 0" class="text-center text-medium-emphasis">
              No data to display
            </div>
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
              <div class="text-h6 text-center mb-4">Gender Pie</div>
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
  
  // Define allowed cities
  const allowedCities = [
    "Langendorf",
    "Oberdorf",
    "Bellach",
    "Rüttenen",
    "Solothurn",
    "Bettlach",
    "Selzach",
    "Lommiswil"
  ];
  
  // Collect unique participant IDs from filtered events
  const participantIds = new Set<string>();
  filteredEvents.forEach(eventEntry => {
    eventEntry.event.participants.forEach(participantId => {
      participantIds.add(participantId);
    });
  });
  
  // Count cities from participants
  const cityCounts: { [key: string]: number } = {};
  let andereCount = 0;
  
  dataStore.persons.forEach(personEntry => {
    if (participantIds.has(personEntry._id)) {
      const city = personEntry.person.city || 'Unknown';
      
      // Check if city is in the allowed list
      if (allowedCities.includes(city)) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      } else {
        andereCount++;
      }
    }
  });
  
  // Add "Andere" category if there are other cities
  if (andereCount > 0) {
    cityCounts['Andere'] = andereCount;
  }
  
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

// Calculate weekly statistics
const weeklyStats = computed(() => {
  const filteredEvents = getFilteredEvents();
  if (filteredEvents.length === 0) return [];
  
  // Group events by week
  const weekMap = new Map<string, { weekNumber: number; year: number; visitors: number }>();
  
  filteredEvents.forEach(eventEntry => {
    const eventDate = new Date(eventEntry.event.eventDate);
    const year = eventDate.getFullYear();
    const weekNumber = getWeekNumber(eventDate);
    const weekKey = `${year}-W${weekNumber}`;
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { weekNumber, year, visitors: 0 });
    }
    
    const week = weekMap.get(weekKey)!;
    week.visitors += eventEntry.event.participants.length;
  });
  
  // Convert to array and sort by year and week
  return Array.from(weekMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.weekNumber - b.weekNumber;
    });
});

// Helper function to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const maxWeeklyVisitors = computed(() => {
  if (weeklyStats.value.length === 0) return 0;
  return Math.max(...weeklyStats.value.map(w => w.visitors));
});

const pointSpacing = computed(() => {
  const numWeeks = weeklyStats.value.length;
  if (numWeeks === 0) return 0;
  return Math.min(700 / (numWeeks - 1 || 1), 100);
});

// Generate line path for the chart
const linePath = computed(() => {
  if (weeklyStats.value.length === 0) return '';
  
  const maxVisitors = maxWeeklyVisitors.value || 1;
  const spacing = pointSpacing.value;
  
  return weeklyStats.value.map((week, index) => {
    const x = 60 + index * spacing + spacing / 2;
    const y = 330 - (week.visitors / maxVisitors) * 280;
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
});

// Generate area path (filled area under the line)
const lineAreaPath = computed(() => {
  if (weeklyStats.value.length === 0) return '';
  
  const maxVisitors = maxWeeklyVisitors.value || 1;
  const spacing = pointSpacing.value;
  
  const linePart = weeklyStats.value.map((week, index) => {
    const x = 60 + index * spacing + spacing / 2;
    const y = 330 - (week.visitors / maxVisitors) * 280;
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  // Close the path to the baseline
  const lastX = 60 + (weeklyStats.value.length - 1) * spacing + spacing / 2;
  const firstX = 60 + spacing / 2;
  
  return `${linePart} L ${lastX} 330 L ${firstX} 330 Z`;
});

const barWidth = computed(() => {
  const numWeeks = weeklyStats.value.length;
  if (numWeeks === 0) return 0;
  return Math.min(700 / numWeeks, 60);
});

const barPadding = computed(() => barWidth.value * 0.1);

const averageVisitorsPerWeek = computed(() => {
  if (weeklyStats.value.length === 0) return 0;
  const total = weeklyStats.value.reduce((sum, week) => sum + week.visitors, 0);
  return (total / weeklyStats.value.length).toFixed(1);
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
  // Initially, no year or event name is selected
  selectedYears.value = [];
  selectedEventNames.value = [];
});

// Watch for year changes and update selectedEventNames to only include available ones
watch(availableEventNames, (newEventNames) => {
  // Filter selectedEventNames to only include ones that are still available
  selectedEventNames.value = selectedEventNames.value.filter(name => 
    newEventNames.includes(name)
  );
});
</script>
