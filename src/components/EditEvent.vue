<template>
  <v-container>
    <v-row v-if="dataStore.loading">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-skeleton-loader type="heading" width="200" />
            <v-spacer />
            <v-skeleton-loader type="button" />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="text" width="100%" class="mb-4" />
            <v-row>
              <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
              <v-col cols="12" md="6"><v-skeleton-loader type="text" /></v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6"><v-skeleton-loader type="card" height="300" /></v-col>
              <v-col cols="12" md="6"><v-skeleton-loader type="card" height="300" /></v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center" color="primary">
            <v-icon class="mr-2">mdi-calendar</v-icon>
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
                <v-col cols="12">
                  <v-select
                    v-model="form.name"
                    :items="eventTypes"
                    label="Event"
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
                    label="Datum"
                    type="date"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                    @blur="autoSave"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.place"
                    label="Ort"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                    @blur="autoSave"
                  />
                </v-col>
              </v-row>
              
              <!-- Participants Selection: Two Tables Side by Side -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center pa-3 bg-primary">
                      <span>Besucher ({{ filteredSelectedParticipants.length }})</span>
                      <v-spacer />
                      <v-btn
                        icon="mdi-ghost"
                        size="small"
                        variant="text"
                        @click="addDummyDialog = true"
                        title="Add Dummy Participants"
                      />
                      <v-btn
                        icon="mdi-account-plus"
                        size="small"
                        variant="text"
                        @click="addPersonDialog = true"
                        title="Neue lappe"
                      />
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pa-2">
                      <v-text-field
                        v-model="participantSearch"
                        label="Search participants..."
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
                            <th class="text-left">Name</th>
                            <th class="text-left">Birthday</th>
                            <th class="text-left">Place</th>
                            <th class="text-left" style="width: 60px;"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="filteredSelectedParticipants.length === 0">
                            <td colspan="4" class="text-center text-grey pa-4">
                              {{ participantSearch ? 'No matching participants' : 'No participants added yet' }}
                            </td>
                          </tr>
                          <tr v-for="participant in filteredSelectedParticipants" :key="participant.id">
                            <td>{{ participant.fullName }}</td>
                            <td>{{ participant.birthdate ? formatDate(participant.birthdate) : 'N/A' }}</td>
                            <td>{{ participant.city || 'N/A' }}</td>
                            <td>
                              <v-btn
                                icon="mdi-minus-circle"
                                size="small"
                                variant="text"
                                color="error"
                                @click="promptRemoveParticipant(participant.id)"
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
                      <span>Verfügbari Lappe ({{ filteredAvailablePersons.length }})</span>
                      <v-spacer />
                      <v-switch
                        v-if="isAdmin"
                        v-model="hideAvailableDummies"
                        label="Hide Dummies"
                        color="primary"
                        hide-details
                        density="compact"
                        inset
                      />
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pa-2">
                      <v-text-field
                        v-model="personSearch"
                        label="Search persons..."
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
                            <th class="text-left">Name</th>
                            <th class="text-left">Geburtsdatum</th>
                            <th class="text-left">Ort</th>
                            <th class="text-right" style="width: 100px;">Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="filteredAvailablePersons.length === 0">
                            <td colspan="4" class="text-center text-grey pa-4">
                              {{ personSearch ? 'Keini passende Lappe' : 'Aui Lappe si derbi!' }}
                            </td>
                          </tr>
                          <tr v-for="person in filteredAvailablePersons" :key="person.id">
                            <td>{{ person.fullName }}</td>
                            <td>{{ person.birthdate ? formatDate(person.birthdate) : 'N/A' }}</td>
                            <td>{{ person.city || 'N/A' }}</td>
                            <td class="text-right text-no-wrap" style="width: 100px;">
                              <v-btn
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                color="grey-darken-1"
                                class="mr-1"
                                @click="editPerson(person.id)"
                                title="Edit Lappe"
                              />
                              <v-btn
                                icon="mdi-plus-circle"
                                size="small"
                                variant="text"
                                color="primary"
                                @click="addParticipant(person.id)"
                                title="Add"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                  </v-card>
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

    <v-dialog v-model="eventTypeChangeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5" color="warning">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Bisch sicher?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEventTypeChange"
          >
            Nö
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="loading"
            @click="confirmEventTypeChange"
          >
            Jup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="eventTypeChangeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5" color="warning">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Bisch sicher?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEventTypeChange"
          >
            Nö
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="loading"
            @click="confirmEventTypeChange"
          >
            Jup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addPersonDialog" max-width="800" persistent>
      <AddPerson
        :is-dialog="true"
        @person-added="handleNewPersonAdded"
        @cancel="addPersonDialog = false"
      />
    </v-dialog>

    <!-- Remove Participant Confirmation Dialog -->
    <v-dialog v-model="removeParticipantDialog" max-width="400">
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
            @click="removeParticipantDialog = false"
          >
            Nö
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmRemoveParticipant"
          >
            Jup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Dummy Dialog -->
    <AddDummy
      v-model="addDummyDialog"
      :event-id="eventId"
      @dummies-added="handleDummiesAdded"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useDataStore } from '@/stores';
import { websocketService } from '@/services/websocketService';
import type { Event, EventEntry } from '@/types';
import AddDummy from './AddDummy.vue';
import AddPerson from './AddPerson.vue';

const router = useRouter();
const route = useRoute();
const dataStore = useDataStore();

const formValid = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const eventTypeChangeDialog = ref(false);
const removeParticipantDialog = ref(false);
const participantToRemove = ref<string | null>(null);
const personSearch = ref('');
const participantSearch = ref('');
const hideAvailableDummies = ref(true);
const eventTypes = ref<string[]>([]);
const isUpdatingFromWebSocket = ref(false);
const addPersonDialog = ref(false);
const addDummyDialog = ref(false);
const originalEventType = ref('');
const isRevertingEventType = ref(false);
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

const eventId = computed(() => route.params.id as string);
const isAdmin = computed(() => authService.getUser()?.role === 'Admin');

const allPersons = computed(() => {
  return dataStore.persons
    .map(personEntry => {
      const fullName = `${personEntry.person.firstname} ${personEntry.person.lastname}`;
      const genderIcon = getGenderIcon(personEntry.person.gender);
      return {
        id: personEntry._id,
        fullName,
        birthdate: personEntry.person.birthdate,
        city: personEntry.person.city,
        searchText: fullName,
        genderIcon
      };
    });
});

const availablePersons = computed(() => {
  return allPersons.value.filter(person => 
    !form.value.participants.includes(person.id)
  );
});

const selectedParticipants = computed(() => {
  return form.value.participants
    .map(participantId => allPersons.value.find(p => p.id === participantId))
    .filter(p => p !== undefined);
});

const filteredSelectedParticipants = computed(() => {
  if (!participantSearch.value) {
    return selectedParticipants.value;
  }
  const query = participantSearch.value.toLowerCase();
  return selectedParticipants.value.filter(participant => 
    participant.fullName.toLowerCase().includes(query) ||
    participant.city?.toLowerCase().includes(query) ||
    (participant.birthdate && formatDate(participant.birthdate).includes(query))
  );
});

const filteredAvailablePersons = computed(() => {
  let persons = availablePersons.value;
  
  if (hideAvailableDummies.value) {
    persons = persons.filter(person => 
      !person.fullName.startsWith('#DUMMY')
    );
  }
  
  if (!personSearch.value) {
    return persons;
  }
  const query = personSearch.value.toLowerCase();
  return persons.filter(person => 
    person.fullName.toLowerCase().includes(query) ||
    person.city?.toLowerCase().includes(query) ||
    (person.birthdate && formatDate(person.birthdate).includes(query))
  );
});

const addParticipant = (participantId: string) => {
  if (!form.value.participants.includes(participantId)) {
    form.value.participants.push(participantId);
  }
};

const promptRemoveParticipant = (participantId: string) => {
  participantToRemove.value = participantId;
  removeParticipantDialog.value = true;
};

const confirmRemoveParticipant = () => {
  if (participantToRemove.value) {
    form.value.participants = form.value.participants.filter(id => id !== participantToRemove.value);
    participantToRemove.value = null;
  }
  removeParticipantDialog.value = false;
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('de-DE');
  } catch {
    return '';
  }
};

const showSnackbar = (text: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color };
};

const handleNewPersonAdded = (newId: string) => {
  addPersonDialog.value = false;
  
  if (newId) {
    if (!form.value.participants.includes(newId)) {
      form.value.participants.push(newId);
      showSnackbar(`Looks good💩`);
    }
  }
};

const autoSave = async () => {
  if (!formValid.value || isUpdatingFromWebSocket.value) return;
  
  try {
    await apiService.updateEvent(eventId.value, form.value);
  } catch (error) {
    console.error('Auto-save failed:', error);
    showSnackbar('Auto-save failed', 'error');
  }
};

const handleSave = async () => {
  if (!formValid.value) return;
  
  loading.value = true;
  
  try {
    await apiService.updateEvent(eventId.value, form.value);
    

    await dataStore.fetchEvents();
    
  } catch (error) {
    console.error('Error updating event:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to update event',
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const cancelEventTypeChange = () => {
  isRevertingEventType.value = true;
  form.value.name = originalEventType.value;
  eventTypeChangeDialog.value = false;
  setTimeout(() => {
    isRevertingEventType.value = false;
  }, 100);
};

const confirmEventTypeChange = async () => {
  eventTypeChangeDialog.value = false;
  originalEventType.value = form.value.name;
};

const handleBack = async () => {
  if (formValid.value) {
    try {
      await apiService.updateEvent(eventId.value, form.value);
      await dataStore.fetchEvents();
    } catch (error) {
      console.error('Error saving before back:', error);
    }
  }
  router.push({ name: 'events' });
};

const editPerson = (personId: string) => {
  if (formValid.value) {
    apiService.updateEvent(eventId.value, form.value).catch(err => console.error(err));
  }
  
  router.push({ 
    name: 'person-edit', 
    params: { id: personId },
    query: { returnTo: 'event-edit', returnId: eventId.value }
  });
};

const handleDelete = () => {
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  deleteDialog.value = false;
  loading.value = true;
  
  try {
    await apiService.deleteEvent(eventId.value);
    showSnackbar('Event deleted successfully');
    

    await dataStore.fetchEvents();
    

    setTimeout(() => {
      router.push({ name: 'events' });
    }, 500);
    
  } catch (error) {
    console.error('Error deleting event:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to delete event',
      'error'
    );
    loading.value = false;
  }
};
watch(() => form.value.name, (newValue) => {
  if (isRevertingEventType.value || isUpdatingFromWebSocket.value) return;
  
  if (newValue !== originalEventType.value) {
    eventTypeChangeDialog.value = true;
  } else {
    autoSave();
  }
});
watch(() => form.value.participants, autoSave, { deep: true });

const handleEventUpdate = (eventEntry: EventEntry) => {
  if (eventEntry._id === eventId.value) {
   const serverData = {
      name: eventEntry.event.name,
      eventDate: formatDateForInput(eventEntry.event.eventDate),
      place: eventEntry.event.place,
      comments: eventEntry.event.comments,
      participants: eventEntry.event.participants
    };
    

    isUpdatingFromWebSocket.value = true;
    

    form.value.name = serverData.name;
    form.value.eventDate = serverData.eventDate;
    form.value.place = serverData.place;
    form.value.comments = serverData.comments;
    form.value.participants = [...serverData.participants];
    

    originalEventType.value = serverData.name;
    

    setTimeout(() => {
      isUpdatingFromWebSocket.value = false;
    }, 100);
  }
};

const handleEventDelete = (eventEntry: EventEntry) => {
  if (eventEntry._id === eventId.value) {
    showSnackbar('Event was deleted by another user', 'error');
    setTimeout(() => {
      router.push({ name: 'events' });
    }, 800);
  }
};

const handlePersonUpdate = async () => {
  await dataStore.fetchPersons();
};

const handleDummiesAdded = async (personIds: string[]) => {
  await dataStore.fetchPersons();
  
  personIds.forEach(personId => {
    if (!form.value.participants.includes(personId)) {
      form.value.participants.push(personId);
    }
  });
  
  await handleSave();
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

onMounted(async () => {
  try {
    const constants = await apiService.getConstants();
    eventTypes.value = constants.event_types;
  } catch (error) {
    console.error('Error fetching constants:', error);
    showSnackbar('Failed to load event types', 'error');
  }
  
  if (dataStore.persons.length === 0 || dataStore.events.length === 0) {
    await dataStore.fetchAll();
  }
  
  const existingEvent = dataStore.events.find(e => e._id === eventId.value);
  if (existingEvent) {
    form.value = { 
      ...existingEvent.event,
      eventDate: formatDateForInput(existingEvent.event.eventDate)
    };
    originalEventType.value = existingEvent.event.name;
  } else {

    await dataStore.fetchEvents();
    const event = dataStore.events.find(e => e._id === eventId.value);
    if (event) {
      form.value = { 
        ...event.event,
        eventDate: formatDateForInput(event.event.eventDate)
      };
      originalEventType.value = event.event.name;
    }
  }
  
  websocketService.on('event:updated', handleEventUpdate);
  websocketService.on('event:deleted', handleEventDelete);
  websocketService.on('person:updated', handlePersonUpdate);
});

onUnmounted(() => {
  websocketService.off('event:updated', handleEventUpdate);
  websocketService.off('event:deleted', handleEventDelete);
  websocketService.off('person:updated', handlePersonUpdate);
});
</script>

<style scoped>
.participants-table {
  max-height: 400px;
  overflow-y: auto;
}

.participants-table tbody tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
