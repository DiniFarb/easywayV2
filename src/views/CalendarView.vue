<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center pa-4">
            <v-icon icon="mdi-calendar" class="mr-2" />
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="previousMonth"
            />
            <span class="mx-4">{{ currentMonthYear }}</span>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click="nextMonth"
            />
            <v-btn
              variant="text"
              size="small"
              class="ml-2"
              @click="goToToday"
            >
              Today
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="$router.push({ name: 'event-add' })"
            >
              Add Event
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-calendar
              v-model="selectedDate"
              :events="calendarEvents"
              :weekdays="[1, 2, 3, 4, 5, 6, 0]"
              @click:event="handleEventClick"
            >
              <template #event="{ event }">
                <div class="v-event-summary">
                  {{ event.title }}
                </div>
              </template>
            </v-calendar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores';

const router = useRouter();
const dataStore = useDataStore();
const selectedDate = ref(new Date());

const currentMonthYear = computed(() => {
  return selectedDate.value.toLocaleDateString('de-DE', { 
    month: 'long', 
    year: 'numeric' 
  });
});

const previousMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  selectedDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  selectedDate.value = newDate;
};

const goToToday = () => {
  selectedDate.value = new Date();
};

const calendarEvents = computed(() => {
  return dataStore.events.map(eventEntry => ({
    id: eventEntry._id,
    title: eventEntry.event.name,
    start: new Date(eventEntry.event.eventDate),
    end: new Date(eventEntry.event.eventDate),
    allDay: true,
    color: 'primary'
  }));
});

const handleEventClick = (clickEvent: Event, eventData: any) => {
  router.push({ name: 'event-edit', params: { id: eventData.event.id } });
};

onMounted(async () => {
  await dataStore.fetchEvents();
});
</script>
