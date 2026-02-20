<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title color="primary">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            Add New Event
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="form.name"
                    :items="eventTypes"
                    label="Event Name"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.eventDate"
                    label="Event Date"
                    type="date"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.place"
                    label="Place"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.comments"
                    label="Comments"
                    variant="outlined"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="grey"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="handleBack"
            >
              Back
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              :disabled="!formValid || loading"
              :loading="loading"
              @click="handleSubmit"
            >
              Add Event
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/apiService';
import { useDataStore } from '@/stores';
import type { Event } from '@/types';

const router = useRouter();
const dataStore = useDataStore();

const formValid = ref(false);
const loading = ref(false);
const eventTypes = ref<string[]>([]);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const form = ref<Event>({
  name: '',
  eventDate: '',
  place: '',
  comments: '',
  participants: []
});

const rules = {
  required: (value: string) => !!value || 'This field is required'
};

const showSnackbar = (text: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color };
};

const handleSubmit = async () => {
  if (!formValid.value) return;
  
  loading.value = true;
  
  try {
    const resp = await apiService.addEvent(form.value);
    showSnackbar(`Looks good💩`);
    
    // Refresh the data store
    await dataStore.fetchEvents();
    
    // Wait a bit for WebSocket to receive the new event
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    
    if (resp && resp.newID) {
      // Navigate to edit mode with the new event ID
      setTimeout(() => {
        router.push({ name: 'event-edit', params: { id: resp.newID } });
      }, 500);
    } else {
      // Fallback to events view if event not found
      setTimeout(() => {
        router.push({ name: 'events' });
      }, 800);
    }
    
  } catch (error) {
    console.error('Error creating event:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to create event',
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push({ name: 'events' });
};

onMounted(async () => {
  // Fetch constants for event types
  try {
    const constants = await apiService.getConstants();
    eventTypes.value = constants.event_types;
  } catch (error) {
    console.error('Error fetching constants:', error);
    showSnackbar('Failed to load event types', 'error');
  }
});
</script>

<style scoped>
</style>
