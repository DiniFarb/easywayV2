<template>
  <v-dialog v-model="isOpen" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
        Add 👻
        <v-spacer />
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="handleCancel"
        />
      </v-card-title>
      <v-card-text>
        <v-form v-model="formValid" @submit.prevent="handleAdd">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.number="form.amount"
                label="Amount"
                type="number"
                min="1"
                :rules="[rules.required, rules.minAmount]"
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
                <v-btn value="M" icon="mdi-face-man" size="x-large" class="px-6" title="Male"></v-btn>
                <v-btn value="W" icon="mdi-face-woman" size="x-large" class="px-6" title="Female"></v-btn>
                <v-btn value="O" icon="mdi-face-man-shimmer" size="x-large" class="px-6" title="Other"></v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.number="form.age"
                label="Alter"
                type="number"
                min="0"
                max="120"
                :rules="[rules.required, rules.minAge]"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="form.place"
                label="Stadt"
                :items="relevantCities"
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
          color="primary"
          variant="flat"
          @click="handleAdd"
          :loading="loading"
          :disabled="!formValid"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { apiService } from '@/services/apiService';

interface Props {
  modelValue: boolean;
  eventId?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'dummiesAdded', personIds: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(props.modelValue);
const formValid = ref(false);
const loading = ref(false);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

const relevantCities = ref<string[]>([]);

onMounted(async () => {
  try {
    const constants = await apiService.getConstants();
    if (constants.relevant_cities) {
      relevantCities.value = constants.relevant_cities.filter(city => city !== 'Andere');
    }
  } catch (error) {
    console.error('Failed to fetch relevant cities:', error);
  }
});

const form = ref({
  amount: 1,
  gender: 'M',
  age: 12,
  place: '',
  comments: ''
});

const rules = {
  required: (v: any) => !!v || 'This field is required',
  minAmount: (v: number) => v >= 1 || 'Amount must be at least 1',
  minAge: (v: number) => v >= 0 || 'Age must be 0 or greater'
};

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
});

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue);
});

const calculateBirthdate = (age: number): string => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  return `${birthYear}-01-01`;
};

const handleAdd = async () => {
  if (!formValid.value) return;
  
  const formCopy = { ...form.value };
  handleCancel();
  
  snackbar.value = { 
    show: true, 
    text: `Adding ${formCopy.amount} 👻...`, 
    color: 'info',
    timeout: -1 
  };
  
  const createdPersonIds: string[] = [];
  
  try {
    for (let i = 0; i < formCopy.amount; i++) {
      const birthdate = calculateBirthdate(formCopy.age);
      
      const dummyPerson = {
        firstname: '#DUMMY',
        lastname: '#DUMMY',
        birthdate: birthdate,
        gender: formCopy.gender,
        city: formCopy.place,
        phone: '',
        emergency_phone: '',
        comments: formCopy.comments || ''
      };
      
      const personEntry = await apiService.addPerson(dummyPerson);
      if (personEntry && personEntry.newID) {
        createdPersonIds.push(personEntry.newID);
      }
      
      if (i < formCopy.amount - 1) {
        snackbar.value = { 
          show: true, 
          text: `${i + 1} / ${formCopy.amount} 👻 drinne`, 
          color: 'info',
          timeout: -1 
        };
      }
    }
    
    emit('dummiesAdded', createdPersonIds);
    snackbar.value = { 
      show: true, 
      text: `${formCopy.amount} 👻 drinne! looks good 💩`, 
      color: 'success',
      timeout: 3000
    };
  } catch (error) {
    console.error('Failed to create dummy persons:', error);
    snackbar.value = { 
      show: true, 
      text: 'Failed to create dummy persons.', 
      color: 'error',
      timeout: 3000
    };
  }
};

const handleCancel = () => {
  form.value = {
    amount: 1,
    gender: 'M',
    age: 12,
    place: '',
    comments: ''
  };
  formValid.value = false;
  isOpen.value = false;
};
</script>
