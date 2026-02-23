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
                  label="Event Typ"
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
                </div>
              </v-col>
              <v-col cols="12" md="6" class="text-center">
                <div class="text-h3">{{ filteredEventsCount }}</div>
                <div class="text-subtitle-1 text-medium-emphasis">
                  <v-icon class="mr-2" size="small">mdi-calendar</v-icon>
                </div>
              </v-col>
            </v-row>

            <!-- Loading State -->
            <v-row v-if="dataStore.loading" class="mt-4">
              <v-col cols="12" md="6" class="d-flex flex-column align-center">
                <v-skeleton-loader type="heading" width="100" class="mb-2" />
                <v-skeleton-loader type="text" width="80" />
              </v-col>
              <v-col cols="12" md="6" class="d-flex flex-column align-center">
                <v-skeleton-loader type="heading" width="100" class="mb-2" />
                <v-skeleton-loader type="text" width="80" />
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

    <!-- Average Visitors Card -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <div v-if="dataStore.loading" class="d-flex justify-center align-center" style="height: 400px;">
              <v-skeleton-loader type="image" width="100%" height="100%" />
            </div>
            <div v-else-if="!dataStore.loading && monthlyStats.length > 24" class="text-center text-medium-emphasis">
              Chli viu, muesi no verbessere 😅
            </div>
            <div v-else-if="!dataStore.loading && !dataStore.error && monthlyStats.length > 0">
              <div class="text-h6 text-center mb-4">Besucher pro Monat</div>
              <v-row>
                <v-col cols="12" class="d-flex justify-center">
                  <VisitorsChart :data="monthlyStats" style="width: 100%;" />
                </v-col>
              </v-row>
              <div class="text-center mt-4">
                <v-chip color="primary" variant="outlined">
                  ⌀ {{ overallAverageVisitorsPerMonth }}/mon
                </v-chip>
              </div>
            </div>
            <div v-else-if="!dataStore.loading && monthlyStats.length === 0" class="text-center text-medium-emphasis">
              Nix
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
            <div v-if="dataStore.loading" class="d-flex justify-center align-center" style="height: 300px;">
              <v-skeleton-loader type="image" width="200" height="200" />
            </div>
            <div v-else-if="!dataStore.loading && !dataStore.error && filteredPersonsCount > 0">
              <div class="text-h6 text-center mb-4">⚧️ Gender Pie</div>
              <v-row>
                <v-col cols="12">
                   <GenderChart :data="genderStats" />
                </v-col>
              </v-row>
            </div>
            <div v-else-if="!dataStore.loading && filteredPersonsCount === 0" class="text-center text-medium-emphasis">
              Nix
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div v-if="dataStore.loading" class="d-flex justify-center align-center" style="height: 300px;">
              <v-skeleton-loader type="image" width="200" height="200" />
            </div>
            <div v-else-if="!dataStore.loading && !dataStore.error && filteredEventsCount > 0">
              <div class="text-h6 text-center mb-4">🏘️ Käffli Pie</div>
              <v-row>
                <v-col cols="12">
                   <PlaceChart :data="placeStats" />
                </v-col>
              </v-row>
            </div>
            <div v-else-if="!dataStore.loading && filteredEventsCount === 0" class="text-center text-medium-emphasis">
              Nix
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
          Export Stats
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '@/stores';
import { exportService } from '@/services/exportService';
import { apiService } from '@/services/apiService';
import VisitorsChart from '@/components/charts/VisitorsChart.vue';
import GenderChart from '@/components/charts/GenderChart.vue';
import PlaceChart from '@/components/charts/PlaceChart.vue';

const dataStore = useDataStore();
const selectedYears = ref<number[]>([]);
const selectedEventNames = ref<string[]>([]);
const relevantCities = ref<string[]>([]);
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

const availableEventNames = computed(() => {
  const names = new Set<string>();
  

  if (selectedYears.value.length === 0) {
    return [];
  }
  

  const eventsToConsider = dataStore.events.filter(eventEntry => {
    if (eventEntry.event.eventDate) {
      const year = new Date(eventEntry.event.eventDate).getFullYear();
      return selectedYears.value.includes(year);
    }
    return false;
  });
  

  eventsToConsider.forEach(eventEntry => {
    if (eventEntry.event.name) {
      names.add(eventEntry.event.name);
    }
  });
  
  return Array.from(names).sort();
});

const availableYears = computed(() => {
  const years = new Set<number>();
  dataStore.events.forEach(eventEntry => {
    if (eventEntry.event.eventDate) {
      const year = new Date(eventEntry.event.eventDate).getFullYear();
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => a - b);
});

const getFilteredEvents = () => {
  return dataStore.events.filter(eventEntry => {
  
    const yearMatch = selectedYears.value.length === 0 || (() => {
      if (eventEntry.event.eventDate) {
        const year = new Date(eventEntry.event.eventDate).getFullYear();
        return selectedYears.value.includes(year);
      }
      return false;
    })();

  
    const nameMatch = selectedEventNames.value.length === 0 || 
      selectedEventNames.value.includes(eventEntry.event.name);

    return yearMatch && nameMatch;
  });
};

const filteredEventsCount = computed(() => {
  return getFilteredEvents().length;
});

const filteredPersonsCount = computed(() => {
  const filteredEvents = getFilteredEvents();
  return filteredEvents.reduce((a,c) => a += c.event.participants.length, 0);
});

const genderStats = computed(() => {
  const genderCounts = { M: 0, W: 0, O: 0 };
  const filteredEvents = getFilteredEvents();
  const gendarMap = dataStore.persons.reduce<Record<string, string>>((a,c)=>{
      let gen = c.person.gender;
      if (gen != "M" && gen != "W") {gen = "O";}
      a[c._id] = gen
      return a;
  },{});
  filteredEvents.forEach(eventEntry => {
  eventEntry.event.participants.forEach(participantId => {
      let gen = gendarMap[participantId]
      if (gen === 'M') {
        genderCounts.M++;
      } else if (gen === 'W') {
        genderCounts.W++;
      } else {
        genderCounts.O++;
      }
    });
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

const placeStats = computed(() => {
  const filteredEvents = getFilteredEvents();
  const cityMap = dataStore.persons.reduce<Record<string, string>>((a,c)=>{
      let city = c.person.city;
      if (relevantCities.value.includes(city)){
        a[c._id] = city;
      } else {
        a[c._id] = "Andere"; 
      }
      return a;
  },{});

  const cityCounts: { [key: string]: number } = {};
  filteredEvents.forEach(eventEntry => {
  eventEntry.event.participants.forEach(participantId => {
      let city = cityMap[participantId]
      if (city === undefined) {
        console.log(`person with id ${participantId} not found`);
        return
      }
      if(cityCounts[city]){
        cityCounts[city]++;
      } else {
        cityCounts[city] = 1;
      }
    });
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

const monthlyStats = computed<Array<{ month: number; year: number; avgVisitors: number; monthName: string; eventCount: number }>>(() => {
  const filteredEvents = getFilteredEvents();
  if (filteredEvents.length === 0) return [];
  

  const monthMap = new Map<string, { month: number; year: number; totalVisitors: number; eventCount: number }>();
  
  filteredEvents.forEach(eventEntry => {
    const eventDate = new Date(eventEntry.event.eventDate);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth();
    const monthKey = `${year}-${month}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { month, year, totalVisitors: 0, eventCount: 0 });
    }
    
    const monthData = monthMap.get(monthKey)!;
    monthData.totalVisitors += eventEntry.event.participants.length;
    monthData.eventCount++;
  });
  

  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  
  return Array.from(monthMap.values())
    .map(data => ({
      month: data.month,
      year: data.year,
      avgVisitors: Math.round(data.totalVisitors / data.eventCount),
      monthName: monthNames[data.month],
      eventCount: data.eventCount
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
});

const overallAverageVisitorsPerMonth = computed(() => {
  if (monthlyStats.value.length === 0) return 0;
  const total = monthlyStats.value.reduce((sum, month) => sum + month.avgVisitors, 0);
  return (total / monthlyStats.value.length).toFixed(1);
});

onMounted(async () => {
  await dataStore.fetchAll();

  selectedYears.value = [new Date().getFullYear()];
  selectedEventNames.value = [];

  try {
    const constants = await apiService.getConstants();
    if (constants.relevant_cities) {
      relevantCities.value = constants.relevant_cities
    }
  } catch (error) {
    console.error('Failed to fetch event types:', error);
  }

});

watch(availableEventNames, (newEventNames) => {

  selectedEventNames.value = selectedEventNames.value.filter(name => 
    newEventNames.includes(name)
  );
});
</script>
