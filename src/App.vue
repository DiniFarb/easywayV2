<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import { authService } from '@/services/authService';

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const drawer = ref(false);
const isAuthenticated = computed(() => authService.isAuthenticated());
const isLoginPage = computed(() => route.name === 'login');

const handleLogout = () => {
  authService.logout();
  router.push({ name: 'login' });
};

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
  drawer.value = false;
};
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-if="!isLoginPage"
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-home"
          title="Home"
          @click="navigateTo('home')"
        />
        <v-list-item
          prepend-icon="mdi-calendar"
          title="Events"
          @click="navigateTo('events')"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="!isLoginPage"
      color="scondary"
    >
      <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Easyway</v-toolbar-title>

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
