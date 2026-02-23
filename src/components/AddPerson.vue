<template>
  <v-container>
    <v-row v-if="dataStore.loading">
       <v-col cols="12">
         <v-skeleton-loader type="card" height="400" />
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
                  <strong>Chönt dopplet si</strong> Lüg mau dä:
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
                  Zeig
                </v-btn>
              </div>
            </v-alert>
            
            <v-form v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.firstname"
                    label="Vorname"
                    :rules="[rules.required]"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.lastname"
                    label="Nachname"
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
                    label="Geburtsdatum"
                    type="date"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.city"
                    label="Stadt"
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
                    label="Telefonnummer"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.emergency_phone"
                    label="Notfalltelefonnummer"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.comments"
                    label="Kommentare"
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
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              :disabled="!formValid || loading"
              :loading="loading"
              @click="handleSubmit"
            >
              Add
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
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/apiService';
import { useDataStore } from '@/stores';
import type { Person, PersonEntry } from '@/types';

const props = defineProps<{
  isDialog?: boolean
}>();

const emit = defineEmits<{
  (e: 'person-added', id: string): void
  (e: 'cancel'): void
}>();

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

const rules = {
  required: (value: string) => !!value || 'Usfülle!😡'
};
const duplicatePerson = ref<PersonEntry | null>(null);

const normalizeDateForComparison = (dateString: string) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

const checkForDuplicate = () => {

  if (!form.value.firstname || !form.value.lastname || !form.value.birthdate) {
    duplicatePerson.value = null;
    return;
  }

  const firstnameLower = form.value.firstname.toLowerCase();
  const lastnameLower = form.value.lastname.toLowerCase();
  const birthdate = form.value.birthdate;

  const match = dataStore.persons.find(personEntry => {
    const storedBirthdate = normalizeDateForComparison(personEntry.person.birthdate);
    const matches = (
      personEntry.person.firstname.toLowerCase() === firstnameLower &&
      personEntry.person.lastname.toLowerCase() === lastnameLower &&
      storedBirthdate === birthdate
    );    
    return matches;
  });

  duplicatePerson.value = match || null;
};
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
    showSnackbar(`Looks good💩`);
    

    await dataStore.fetchPersons();
    

    if (props.isDialog) {
      if (resp && resp.newID) {
        emit('person-added', resp.newID);
      }
      return;
    }


    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (resp && resp.newID) {
  
      setTimeout(() => {
        router.push({ name: 'person-edit', params: { id: resp.newID } });
      }, 500);
    } else {
  
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
  if (props.isDialog) {
    emit('cancel');
  } else {
    router.push({ name: 'persons' });
  }
};

onMounted(async () => {
  if (dataStore.persons.length === 0) {
    await dataStore.fetchPersons();
  }
});
</script>

<style scoped>
</style>
