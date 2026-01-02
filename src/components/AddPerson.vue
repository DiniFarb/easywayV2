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
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.gender"
                    :items="genderOptions"
                    label="Gender"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.city"
                    label="City"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Phone"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/apiService';
import { useDataStore } from '@/stores';
import type { Person } from '@/types';

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
      }, 1000);
    } else {
      // Fallback to persons view if person not found
      setTimeout(() => {
        router.push({ name: 'persons' });
      }, 1500);
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
</script>

<style scoped>
</style>
