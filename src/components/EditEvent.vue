<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center" color="primary">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            Edit Event
            <v-spacer />
            <v-btn
              color="grey"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="handleBack"
            >
              Back
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValid" @submit.prevent="handleSave">
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
                    @blur="autoSave"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.place"
                    label="Place"
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
                      <span>Participants ({{ filteredSelectedParticipants.length }})</span>
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
                        title="Add Person"
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
                      <span>Available Persons ({{ filteredAvailablePersons.length }})</span>
                      <v-spacer />
                      <v-switch
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
                            <th class="text-left">Birthday</th>
                            <th class="text-left">Place</th>
                            <th class="text-left" style="width: 60px;"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="filteredAvailablePersons.length === 0">
                            <td colspan="4" class="text-center text-grey pa-4">
                              {{ personSearch ? 'No matching persons' : 'All persons have been added' }}
                            </td>
                          </tr>
                          <tr v-for="person in filteredAvailablePersons" :key="person.id">
                            <td>{{ person.fullName }}</td>
                            <td>{{ person.birthdate ? formatDate(person.birthdate) : 'N/A' }}</td>
                            <td>{{ person.city || 'N/A' }}</td>
                            <td>
                              <v-btn
                                icon="mdi-plus-circle"
                                size="small"
                                variant="text"
                                color="primary"
                                @click="addParticipant(person.id)"
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
              Delete
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
          Confirm Deletion
        </v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to delete this event? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="loading"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="eventTypeChangeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5" color="warning">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Confirm Event Type Change
        </v-card-title>
        <v-card-text class="pt-4">
          You are changing the event type from <strong>{{ originalEventType }}</strong> to <strong>{{ form.name }}</strong>. Are you sure you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEventTypeChange"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="loading"
            @click="confirmEventTypeChange"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="eventTypeChangeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5" color="warning">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Confirm Event Type Change
        </v-card-title>
        <v-card-text class="pt-4">
          You are changing the event type from <strong>{{ originalEventType }}</strong> to <strong>{{ form.name }}</strong>. Are you sure you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEventTypeChange"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="loading"
            @click="confirmEventTypeChange"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Person Dialog -->
    <v-dialog v-model="addPersonDialog" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-primary">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Add New Person
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form v-model="personFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.firstname"
                  label="First Name"
                  :rules="[personRules.required]"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.lastname"
                  label="Last Name"
                  :rules="[personRules.required]"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.birthdate"
                  label="Birthdate"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.city"
                  label="City"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" class="d-flex justify-center my-4">
                <v-btn-toggle
                  v-model="personForm.gender"
                  color="primary"
                  mandatory
                  divided
                  variant="outlined"
                >
                  <v-btn value="M" icon="mdi-gender-male" size="x-large" class="px-6" title="Male"></v-btn>
                  <v-btn value="W" icon="mdi-gender-female" size="x-large" class="px-6" title="Female"></v-btn>
                  <v-btn value="O" icon="mdi-gender-male-female" size="x-large" class="px-6" title="Other"></v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.phone"
                  label="Phone"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="personForm.emergency_phone"
                  label="Emergency Phone"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="personForm.comments"
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
            @click="closeAddPersonDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            :disabled="!personFormValid || addingPerson"
            :loading="addingPerson"
            @click="handleAddPerson"
          >
            Add Person
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remove Participant Confirmation Dialog -->
    <v-dialog v-model="removeParticipantDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 bg-warning">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Remove Participant
        </v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to remove this participant from the event?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="removeParticipantDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmRemoveParticipant"
          >
            Remove
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
const personFormValid = ref(false);
const addingPerson = ref(false);
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

const personForm = ref({
  firstname: '',
  lastname: '',
  birthdate: '',
  gender: '',
  city: '',
  phone: '',
  emergency_phone: '',
  comments: ''
});

const genderOptions = [
  { title: 'Male', value: 'M' },
  { title: 'Female', value: 'W' },
  { title: 'Other', value: 'O' }
];

const rules = {
  required: (value: string) => !!value || 'This field is required'
};

const personRules = {
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
  
  // Filter out dummies if switch is enabled
  if (hideAvailableDummies.value) {
    persons = persons.filter(person => 
      !person.fullName.startsWith('#DUMMY')
    );
  }
  
  // Apply search filter
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

const removeParticipant = (participantId: string) => {
  form.value.participants = form.value.participants.filter(id => id !== participantId);
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

const closeAddPersonDialog = () => {
  addPersonDialog.value = false;
  // Reset form
  personForm.value = {
    firstname: '',
    lastname: '',
    birthdate: '',
    gender: '',
    city: '',
    phone: '',
    emergency_phone: '',
    comments: ''
  };
};

const handleAddPerson = async () => {
  if (!personFormValid.value) return;
  
  addingPerson.value = true;
  
  try {
    // Add person and get the returned person data with ID
    const result = await apiService.addPerson(personForm.value);
    showSnackbar('Person created successfully');
    console.log(result);
    // Refresh the data store
    await dataStore.fetchPersons();
    
    // Add the new person to the event participants using the returned ID
    if (result && result.newID) {
      if (!form.value.participants.includes(result.newID)) {
        form.value.participants.push(result.newID);
        showSnackbar('Person added to event');
      }
    }
    
    closeAddPersonDialog();
    
  } catch (error) {
    console.error('Error creating person:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to create person',
      'error'
    );
  } finally {
    addingPerson.value = false;
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
    
    // Refresh the data store
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
  // Revert to original event type
  isRevertingEventType.value = true;
  form.value.name = originalEventType.value;
  eventTypeChangeDialog.value = false;
  // Reset flag after Vue's next tick
  setTimeout(() => {
    isRevertingEventType.value = false;
  }, 100);
};

const confirmEventTypeChange = async () => {
  eventTypeChangeDialog.value = false;
  // Update original event type to new value
  originalEventType.value = form.value.name;
  // Auto-save will trigger automatically from existing watcher
};

const handleBack = async () => {
  // Save before leaving if form is valid
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

const handleDelete = () => {
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  deleteDialog.value = false;
  loading.value = true;
  
  try {
    await apiService.deleteEvent(eventId.value);
    showSnackbar('Event deleted successfully');
    
    // Refresh the data store
    await dataStore.fetchEvents();
    
    // Navigate back to events view
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

// Watch form fields for auto-save
// Removed watchers for text fields to prevent auto-save on every keystroke
// Kept name watcher as it handles special logic for event type changes (dropdown selection is discrete action)
watch(() => form.value.name, (newValue) => {
  // If we're reverting, don't trigger anything
  if (isRevertingEventType.value || isUpdatingFromWebSocket.value) return;
  
  // Check if event type changed from original
  if (newValue !== originalEventType.value) {
    eventTypeChangeDialog.value = true;
  } else {
    autoSave();
  }
});

// Watch participants changes (this happens via button clicks, not keystrokes, so immediate save is appropriate)
watch(() => form.value.participants, autoSave, { deep: true });

const handleEventUpdate = (eventEntry: EventEntry) => {
  // Only update if this is the event we're currently editing
  if (eventEntry._id === eventId.value) {
   const serverData = {
      name: eventEntry.event.name,
      eventDate: formatDateForInput(eventEntry.event.eventDate),
      place: eventEntry.event.place,
      comments: eventEntry.event.comments,
      participants: eventEntry.event.participants
    };
    
    // Set flag to prevent auto-save
    isUpdatingFromWebSocket.value = true;
    
    // Update each field individually to ensure reactivity
    form.value.name = serverData.name;
    form.value.eventDate = serverData.eventDate;
    form.value.place = serverData.place;
    form.value.comments = serverData.comments;
    form.value.participants = [...serverData.participants];
    
    // Update original event type as well
    originalEventType.value = serverData.name;
    
    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingFromWebSocket.value = false;
    }, 100);
  }
};

const handleEventDelete = (eventEntry: EventEntry) => {
  // If the event being edited was deleted, redirect to events list
  if (eventEntry._id === eventId.value) {
    showSnackbar('Event was deleted by another user', 'error');
    setTimeout(() => {
      router.push({ name: 'events' });
    }, 800);
  }
};

const handlePersonUpdate = async () => {
  // Refresh persons list when a person is updated or added
  await dataStore.fetchPersons();
};

const handleDummiesAdded = async (personIds: string[]) => {
  // Refresh persons first to get the new dummies
  await dataStore.fetchPersons();
  
  // Add the dummy persons to the current event's participants
  personIds.forEach(personId => {
    if (!form.value.participants.includes(personId)) {
      form.value.participants.push(personId);
    }
  });
  
  // Save the updated event
  await handleSave();
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  // Convert ISO date to YYYY-MM-DD format
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
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
  
  // Ensure we have both persons and events data
  if (dataStore.persons.length === 0 || dataStore.events.length === 0) {
    await dataStore.fetchAll();
  }
  
  // Load existing event data
  const existingEvent = dataStore.events.find(e => e._id === eventId.value);
  if (existingEvent) {
    form.value = { 
      ...existingEvent.event,
      eventDate: formatDateForInput(existingEvent.event.eventDate)
    };
    originalEventType.value = existingEvent.event.name;
  } else {
    // If event not found in store, fetch all data
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
  
  // Setup WebSocket listener for real-time updates
  websocketService.on('event:updated', handleEventUpdate);
  websocketService.on('event:deleted', handleEventDelete);
  websocketService.on('person:updated', handlePersonUpdate);
});

onUnmounted(() => {
  // Remove WebSocket listener
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
