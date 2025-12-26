<template>
  <v-container>
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
            Persons
          </v-card-title>
          <v-card-text>
            <div v-if="dataStore.loading" class="text-center">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="dataStore.error" class="text-error">
              {{ dataStore.error }}
            </div>
            <div v-else class="text-h3 text-center">
              {{ dataStore.personsCount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-calendar</v-icon>
            Events
          </v-card-title>
          <v-card-text>
            <div v-if="dataStore.loading" class="text-center">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="dataStore.error" class="text-error">
              {{ dataStore.error }}
            </div>
            <div v-else class="text-h3 text-center">
              {{ dataStore.eventsCount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDataStore } from '@/stores';

const dataStore = useDataStore();

onMounted(async () => {
  await dataStore.fetchAll();
});
</script>
