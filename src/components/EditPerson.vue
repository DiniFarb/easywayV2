<template>
  <v-container>
    <v-row v-if="dataStore.loading">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
             <v-skeleton-loader type="heading" width="150" />
          </v-card-title>
          <v-card-text>
             <v-row>
                <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
                <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
             </v-row>
             <v-row>
                <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
                <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
             </v-row>
             <v-row class="mt-4">
                 <v-col cols="12"><v-skeleton-loader type="table" /></v-col>
             </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center" color="primary">
            <v-icon class="mr-2">mdi-account</v-icon>
            <v-spacer />
            <v-btn
              variant="text"
              icon="mdi-close"
              @click="handleBack"
            />
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="handleSave">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.firstname"
                    label="Vorname"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                    @blur="autoSave"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.lastname"
                    label="Nachname"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                    @blur="autoSave"
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.birthdate"
                    label="Geburtsdatum"
                    type="date"
                    variant="outlined"
                    @blur="autoSave"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="form.city"
                    label="Stadt"
                    :items="relevantCities"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                    @blur="autoSave"
                    @update:model-value="autoSave"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" class="d-flex justify-center my-4">
                  <v-btn-toggle
                    v-model="form.gender"
                    color="primary"
                    mandatory
                    divided
                    variant="outlined"
                    @update:model-value="autoSave"
                  >
                    <v-btn value="M" icon="mdi-face-man" size="x-large" class="px-6" title="Male"></v-btn>
                    <v-btn value="W" icon="mdi-face-woman" size="x-large" class="px-6" title="Female"></v-btn>
                    <v-btn value="O" icon="mdi-face-man-shimmer" size="x-large" class="px-6" title="Other"></v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Telefon"
                    variant="outlined"
                    @blur="autoSave"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.emergency_phone"
                    label="Notfalltelefon"
                    variant="outlined"
                    @blur="autoSave"
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
                    @blur="autoSave"
                  />
                </v-col>
              </v-row>

              <!-- Events Selection: Two Tables Side by Side -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center pa-3 bg-primary">
                      <span>Linked Events ({{ linkedEvents.length }})</span>
                    </v-card-title>
                    <v-divider />
                    <div style="max-height: 400px; overflow-y: auto;">
                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th class="text-left">Event Type</th>
                            <th class="text-left">Date</th>
                            <th class="text-left" style="width: 60px;"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="linkedEvents.length === 0">
                            <td colspan="3" class="text-center text-grey pa-4">
                              No nüt
                            </td>
                          </tr>
                          <tr v-for="event in linkedEvents" :key="event.id">
                            <td>{{ event.name }}</td>
                            <td>{{ formatDate(event.eventDate) }}</td>
                            <td>
                              <v-btn
                                icon="mdi-minus-circle"
                                size="small"
                                variant="text"
                                color="error"
                                @click="promptRemoveFromEvent(event.id)"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center pa-3 bg-grey-lighten-3">
                      <span>Verfüegbari Events ({{ filteredAvailableEvents.length }})</span>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pa-2">
                      <v-text-field
                        v-model="eventSearch"
                        label="Search events..."
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        clearable
                        density="compact"
                        hide-details
                      />
                    </v-card-text>
                    <v-divider />
                    <div style="max-height: 400px; overflow-y: auto;">
                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th class="text-left">Event</th>
                            <th class="text-left">Datum</th>
                            <th class="text-left" style="width: 60px;"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="filteredAvailableEvents.length === 0">
                            <td colspan="3" class="text-center text-grey pa-4">
                              {{ eventSearch ? 'No nüt' : 'Aui linked' }}
                            </td>
                          </tr>
                          <tr v-for="event in filteredAvailableEvents" :key="event.id">
                            <td>{{ event.name }}</td>
                            <td>{{ formatDate(event.eventDate) }}</td>
                            <td>
                              <v-btn
                                icon="mdi-plus-circle"
                                size="small"
                                variant="text"
                                color="primary"
                                @click="addToEvent(event.id)"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="isAdmin"
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              :disabled="loading"
              @click="handleDelete"
            >
              Lösche
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

    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5" color="error">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Bisch sicher?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Nö
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="loading"
            @click="confirmDelete"
          >
            Jup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remove from Event Confirmation Dialog -->
    <v-dialog v-model="removeEventDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 bg-warning">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Bisch sicher?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="removeEventDialog = false"
          >
            Nö
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmRemoveFromEvent"
          >
            Jup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useDataStore } from '@/stores';
import { websocketService } from '@/services/websocketService';
import type { Person, PersonEntry } from '@/types';

const router = useRouter();
const route = useRoute();
const dataStore = useDataStore();

const formValid = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const removeEventDialog = ref(false);
const eventToRemove = ref<string | null>(null);
const eventSearch = ref('');
const relevantCities = ref<string[]>([]);
const isUpdatingFromWebSocket = ref(false);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const form = ref<Person>({
  firstname: '',
  lastname: '',
  birthdate: '',
  gender: '',
  city: '',
  phone: '',
  emergency_phone: '',
  comments: ''
});

const rules = {
  required: (value: string) => !!value || 'This field is required'
};

const personId = computed(() => route.params.id as string);
const isAdmin = computed(() => authService.getUser()?.role === 'Admin');

const allEvents = computed(() => {
  return dataStore.events.map(eventEntry => ({
    id: eventEntry._id,
    name: eventEntry.event.name,
    eventDate: eventEntry.event.eventDate,
    participants: eventEntry.event.participants
  }));
});

const linkedEvents = computed(() => {
  return allEvents.value.filter(event => 
    event.participants.includes(personId.value)
  );
});

const availableEvents = computed(() => {
  return allEvents.value.filter(event => 
    !event.participants.includes(personId.value)
  );
});

const filteredAvailableEvents = computed(() => {
  if (!eventSearch.value) {
    return availableEvents.value;
  }
  const query = eventSearch.value.toLowerCase();
  return availableEvents.value.filter(event => 
    event.name.toLowerCase().includes(query) ||
    formatDate(event.eventDate).includes(query)
  );
});

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('de-DE');
  } catch {
    return '';
  }
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const showSnackbar = (text: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color };
};

const addToEvent = async (eventId: string) => {
  try {
    const event = dataStore.events.find(e => e._id === eventId);
    if (event) {
      const updatedEvent = {
        ...event.event,
        participants: [...event.event.participants, personId.value]
      };
      await apiService.updateEvent(eventId, updatedEvent);
      await dataStore.fetchEvents();
    }
  } catch (error) {
    console.error('Error adding person to event:', error);
    showSnackbar('Failed to add to event', 'error');
  }
};

const promptRemoveFromEvent = (eventId: string) => {
  eventToRemove.value = eventId;
  removeEventDialog.value = true;
};

const confirmRemoveFromEvent = async () => {
  if (eventToRemove.value) {
    await removeFromEvent(eventToRemove.value);
    eventToRemove.value = null;
  }
  removeEventDialog.value = false;
};

const removeFromEvent = async (eventId: string) => {
  try {
    const event = dataStore.events.find(e => e._id === eventId);
    if (event) {
      const updatedEvent = {
        ...event.event,
        participants: event.event.participants.filter(id => id !== personId.value)
      };
      await apiService.updateEvent(eventId, updatedEvent);
      await dataStore.fetchEvents();
    }
  } catch (error) {
    console.error('Error removing person from event:', error);
    showSnackbar('Failed to remove from event', 'error');
  }
};

const autoSave = async () => {
  if (!formValid.value || isUpdatingFromWebSocket.value) return;
  
  try {
    await apiService.updatePerson(personId.value, form.value);
  } catch (error) {
    console.error('Auto-save failed:', error);
    showSnackbar('Auto-save failed', 'error');
  }
};

const handleSave = async () => {
  if (!formValid.value) return;
  
  loading.value = true;
  
  try {
    await apiService.updatePerson(personId.value, form.value);
    

    await dataStore.fetchPersons();
    
  } catch (error) {
    console.error('Error updating person:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to update person',
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const handleBack = async () => {
  if (formValid.value) {
    try {
      await apiService.updatePerson(personId.value, form.value);
      await dataStore.fetchPersons();
    } catch (error) {
      console.error('Error saving before back:', error);
    }
  }

  const returnTo = route.query.returnTo as string;
  const returnId = route.query.returnId as string;
  
  if (returnTo === 'event-edit' && returnId) {
    router.push({ name: 'event-edit', params: { id: returnId } });
  } else {
    router.push({ name: 'persons' });
  }
};

const handleDelete = () => {
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  deleteDialog.value = false;
  loading.value = true;
  
  try {
    await apiService.deletePerson(personId.value);
    showSnackbar(`Looks good💩`);
    await dataStore.fetchPersons();
    setTimeout(() => {
      router.push({ name: 'persons' });
    }, 500);
    
  } catch (error) {
    console.error('Error deleting person:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to delete person',
      'error'
    );
    loading.value = false;
  }
};


const handlePersonUpdate = (personEntry: PersonEntry) => {
  if (personEntry._id === personId.value) {
    console.log('Received WebSocket person update:', personEntry);
    
    const serverData = {
      ...personEntry.person,
      birthdate: formatDateForInput(personEntry.person.birthdate)
    };
    isUpdatingFromWebSocket.value = true;
    form.value = serverData;
    setTimeout(() => {
      isUpdatingFromWebSocket.value = false;
    }, 100);
  }
};

const handlePersonDelete = (personEntry: PersonEntry) => {
  if (personEntry._id === personId.value) {
    showSnackbar('Person was deleted by another user', 'error');
    setTimeout(() => {
      router.push({ name: 'persons' });
    }, 800);
  }
};

const handleEventUpdate = async () => {
  await dataStore.fetchEvents();
};

onMounted(async () => {
  try {
    const constants = await apiService.getConstants();
    if (constants.relevant_cities) {
      relevantCities.value = constants.relevant_cities.filter(city => city !== 'Andere');
    }
  } catch (error) {
    console.error('Failed to fetch relevant cities:', error);
  }

  if (dataStore.persons.length === 0 || dataStore.events.length === 0) {
    await dataStore.fetchAll();
  }
  
  const existingPerson = dataStore.persons.find(p => p._id === personId.value);
  if (existingPerson) {
    form.value = { 
      ...existingPerson.person,
      birthdate: formatDateForInput(existingPerson.person.birthdate)
    };
  } else {

    await dataStore.fetchPersons();
    const person = dataStore.persons.find(p => p._id === personId.value);
    if (person) {
      form.value = { 
        ...person.person,
        birthdate: formatDateForInput(person.person.birthdate)
      };
    }
  }
  
  websocketService.on('person:updated', handlePersonUpdate);
  websocketService.on('person:deleted', handlePersonDelete);
  websocketService.on('event:updated', handleEventUpdate);
});

onUnmounted(() => {
  websocketService.off('person:updated', handlePersonUpdate);
  websocketService.off('person:deleted', handlePersonDelete);
  websocketService.off('event:updated', handleEventUpdate);
});
</script>

<style scoped>
</style>
