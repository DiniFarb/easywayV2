<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title color="primary">
            <v-icon class="mr-2">mdi-account</v-icon>
            Add New Person
          </v-card-title>
          <v-card-text>
            <!-- Duplicate Warning -->
            <v-alert
              v-if="duplicatePerson"
              type="warning"
              variant="tonal"
              class="mb-4"
              density="compact"
            >
              <div class="d-flex align-center justify-space-between">
                <div>
                  <strong>Possible Duplicate:</strong> A person with the same name and birthdate already exists:
                  <strong>{{ duplicatePerson.person.firstname }} {{ duplicatePerson.person.lastname }}</strong>
                  ({{ formatDate(duplicatePerson.person.birthdate) }})
                </div>
                <v-btn
                  color="warning"
                  variant="elevated"
                  size="small"
                  prepend-icon="mdi-open-in-new"
                  :href="getDuplicatePersonLink()"
                  target="_blank"
                  class="ml-4"
                >
                  View Person
                </v-btn>
              </div>
            </v-alert>
            
            <v-form v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.firstname"
                    label="First Name"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.lastname"
                    label="Last Name"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.birthdate"
                    label="Birthdate"
                    type="date"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.city"
                    label="City"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
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
                    v-model="form.phone"
                    label="Phone"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.emergency_phone"
                    label="Emergency Phone"
                    variant="outlined"
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
              Add Person
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
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/apiService';
import { useDataStore } from '@/stores';
import type { Person, PersonEntry } from '@/types';

const router = useRouter();
const dataStore = useDataStore();

const formValid = ref(false);
const loading = ref(false);
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

const genderOptions = [
  { title: 'Male', value: 'M' },
  { title: 'Female', value: 'W' },
  { title: 'Other', value: 'O' }
];

const rules = {
  required: (value: string) => !!value || 'This field is required'
};

// Duplicate person detection
const duplicatePerson = ref<PersonEntry | null>(null);

const normalizeDateForComparison = (dateString: string) => {
  if (!dateString) return '';
  // Extract just the YYYY-MM-DD part
  return dateString.split('T')[0];
};

const checkForDuplicate = () => {
  // Only check if we have all three fields
  if (!form.value.firstname || !form.value.lastname || !form.value.birthdate) {
    duplicatePerson.value = null;
    return;
  }

  const firstnameLower = form.value.firstname.toLowerCase();
  const lastnameLower = form.value.lastname.toLowerCase();
  const birthdate = form.value.birthdate;

  console.log('Checking for duplicate:', { firstnameLower, lastnameLower, birthdate });
  console.log('Persons in store:', dataStore.persons.length);

  // Search in the data store for matching person
  const match = dataStore.persons.find(personEntry => {
    const storedBirthdate = normalizeDateForComparison(personEntry.person.birthdate);
    const matches = (
      personEntry.person.firstname.toLowerCase() === firstnameLower &&
      personEntry.person.lastname.toLowerCase() === lastnameLower &&
      storedBirthdate === birthdate
    );
    
    if (matches) {
      console.log('Found duplicate:', personEntry);
    }
    
    return matches;
  });

  duplicatePerson.value = match || null;
  
  if (match) {
    console.log('Duplicate person found:', match);
  } else {
    console.log('No duplicate found');
  }
};

// Watch for changes in firstname, lastname, and birthdate
watch(
  () => [form.value.firstname, form.value.lastname, form.value.birthdate],
  () => {
    checkForDuplicate();
  },
  { deep: true }
);

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('de-DE');
  } catch {
    return '';
  }
};

const getDuplicatePersonLink = () => {
  if (!duplicatePerson.value) return '#';
  const baseUrl = window.location.origin;
  return `${baseUrl}/person/edit/${duplicatePerson.value._id}`;
};

const showSnackbar = (text: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color };
};

const handleSubmit = async () => {
  if (!formValid.value) return;
  
  loading.value = true;
  
  try {

    const resp = await apiService.addPerson(form.value);
    console.log(resp);
    showSnackbar('All well💩');
    
    // Refresh the data store
    await dataStore.fetchPersons();
    
    // Wait a bit for WebSocket to receive the new person
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (resp && resp.newID) {
      // Navigate to edit mode with the new person ID
      setTimeout(() => {
        router.push({ name: 'person-edit', params: { id: resp.newID } });
      }, 500);
    } else {
      // Fallback to persons view if person not found
      setTimeout(() => {
        router.push({ name: 'persons' });
      }, 800);
    }
    
  } catch (error) {
    console.error('Error creating person:', error);
    showSnackbar(
      error instanceof Error ? error.message : 'Failed to create person',
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push({ name: 'persons' });
};

onMounted(async () => {
  // Ensure persons data is loaded for duplicate checking
  if (dataStore.persons.length === 0) {
    await dataStore.fetchPersons();
  }
});
</script>

<style scoped>
</style>
