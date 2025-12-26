<template>
  <div class="login-page" :style="{ background: backgroundGradient }">
    <div class="login-page-overlay" :style="{ background: blurOverlayGradients }"></div>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12 login-card">
            <v-card-text class="pa-6">
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="credentials.username"
                  label="Username"
                  prepend-icon="mdi-account"
                  type="text"
                  :error-messages="errors.username"
                  required
                  @keyup.enter="handleLogin"
                />
                <v-text-field
                  v-model="credentials.password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  type="password"
                  :error-messages="errors.password"
                  required
                  @keyup.enter="handleLogin"
                />
                <v-alert v-if="errorMessage" type="error" class="mt-3">
                  {{ errorMessage }}
                </v-alert>
              </v-form>
            </v-card-text>
          </v-card>
          
          <v-card class="elevation-8 login-button-card mt-4">
            <v-card-text class="pa-4 text-center">
              <v-btn
                color="primary"
                :loading="loading"
                @click="handleLogin"
                size="large"
                block
              >
                Login
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { authService } from '@/services/authService';
import type { LoginCredentials } from '@/types';

const router = useRouter();
const theme = useTheme();
const loading = ref(false);
const errorMessage = ref('');
const credentials = ref<LoginCredentials>({
  username: '',
  password: '',
});
const errors = ref({
  username: '',
  password: '',
});

const backgroundGradient = computed(() => {
  return theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
});

const blurOverlayGradients = computed(() => {
  return theme.global.current.value.dark
    ? `radial-gradient(circle at 20% 50%, rgba(209, 38, 98, 0.15), transparent 50%),
       radial-gradient(circle at 80% 80%, rgba(126, 21, 58, 0.15), transparent 50%),
       radial-gradient(circle at 40% 20%, rgba(209, 38, 98, 0.2), transparent 50%)`
    : `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
       radial-gradient(circle at 80% 80%, rgba(138, 73, 162, 0.3), transparent 50%),
       radial-gradient(circle at 40% 20%, rgba(102, 126, 234, 0.3), transparent 50%)`;
});

const handleLogin = async () => {
  // Reset errors
  errors.value = { username: '', password: '' };
  errorMessage.value = '';

  // Validate
  if (!credentials.value.username) {
    errors.value.username = 'Username is required';
    return;
  }
  if (!credentials.value.password) {
    errors.value.password = 'Password is required';
    return;
  }

  loading.value = true;

  try {
    await authService.login(credentials.value);
    router.push({ name: 'home' });
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-page-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
}

.login-card {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
