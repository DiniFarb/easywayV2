<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import { authService } from '@/services/authService';
import { useDataStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const dataStore = useDataStore();
const drawer = ref(false);
const isAuthenticated = computed(() => authService.isAuthenticated());
const isLoginPage = computed(() => route.name === 'login');
const isAdmin = computed(() => {
  const user = authService.getUser();
  return user?.role === 'Admin';
});

const handleLogout = () => {
  dataStore.cleanupWebSocket();
  authService.logout();
  router.push({ name: 'login' });
};

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
};

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
  drawer.value = false;
};

const currentPageTitle = computed(() => {
  const routeNameMap: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'events': 'Events',
    'calendar': 'Calendar',
    'activity': 'Activity Log',
    'persons': 'Persons',
    'person-add': 'Add Person',
    'person-edit': 'Edit Person',
    'event-add': 'Add Event',
    'event-edit': 'Edit Event'
  };
  
  return routeNameMap[route.name as string] || 'Easyway';
});

onMounted(() => {
  // Load theme preference from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.global.name.value = savedTheme;
  }
  
  if (isAuthenticated.value) {
    dataStore.initWebSocket();
  }
});

onUnmounted(() => {
  dataStore.cleanupWebSocket();
});
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-if="!isLoginPage"
      v-model="drawer"
      temporary
    >
      <v-list nav dense>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :active="route.name === 'dashboard'"
          color="primary"
          @click="navigateTo('dashboard')"
        />
        <v-list-item
          prepend-icon="mdi-calendar"
          title="Events"
          :active="route.name === 'events'"
          color="primary"
          @click="navigateTo('events')"
        />
        <v-list-item
          prepend-icon="mdi-calendar-month"
          title="Calendar"
          :active="route.name === 'calendar'"
          color="primary"
          @click="navigateTo('calendar')"
        />
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Persons"
          :active="route.name === 'persons'"
          color="primary"
          @click="navigateTo('persons')"
        />
        <v-list-item
          prepend-icon="mdi-history"
          title="Activity"
          v-if="isAdmin"
          :active="route.name === 'activity'"
          color="primary"
          @click="navigateTo('activity')"
        />
      </v-list>
      <template #append>
        <v-divider />
        <v-list-item>
          <v-list-item-title class="text-caption font-weight-bold">
            {{ authService.getUser()?.username || 'Unknown' }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ authService.getUser()?.role || 'No role' }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      v-if="!isLoginPage"
      color="scondary"
    >
      <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <v-btn v-if="isAuthenticated" icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
