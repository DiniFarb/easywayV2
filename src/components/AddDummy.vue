<template>
  <v-dialog v-model="isOpen" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
        Add Dummy Participants
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
            <v-col cols="12">
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
            <v-col cols="12">
              <v-text-field
                v-model.number="form.age"
                label="Age"
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
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleAdd"
          :loading="loading"
          :disabled="!formValid"
        >
          Add Dummies
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

const form = ref({
  amount: 1,
  gender: '',
  age: 18,
  place: '',
  comments: ''
});

const genderOptions = [
  { title: 'Male', value: 'M' },
  { title: 'Female', value: 'W' },
  { title: 'Other', value: 'O' }
];

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
  
  loading.value = true;
  const createdPersonIds: string[] = [];
  
  try {
    // Create dummy persons based on amount
    for (let i = 0; i < form.value.amount; i++) {
      const birthdate = calculateBirthdate(form.value.age);
      
      const dummyPerson = {
        firstname: '#DUMMY',
        lastname: '#DUMMY',
        birthdate: birthdate,
        gender: form.value.gender,
        city: form.value.place,
        phone: '',
        emergency_phone: '',
        comments: form.value.comments || ''
      };
      
      const personEntry = await apiService.addPerson(dummyPerson);
      if (personEntry && personEntry.newID) {
        createdPersonIds.push(personEntry.newID);
      }
    }
    
    emit('dummiesAdded', createdPersonIds);
    handleCancel();
  } catch (error) {
    console.error('Failed to create dummy persons:', error);
    alert('Failed to create dummy persons. Please try again.');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  form.value = {
    amount: 1,
    gender: '',
    age: 18,
    place: '',
    comments: ''
  };
  formValid.value = false;
  isOpen.value = false;
};
</script>
