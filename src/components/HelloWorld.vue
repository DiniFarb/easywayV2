<script setup lang="ts">
import { ref } from 'vue'

const counter = ref(0)
</script>

<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :width="300"
          aspect-ratio="16/9"
          cover
          src="https://vuetifyjs.com/images/logos/vuetify-logo-v3-slim-text-light.svg"
          class="mx-auto"
        ></v-img>
      </v-col>

      <v-col class="mb-4">
        <h1 class="text-h2 font-weight-bold mb-3">
          Welcome to Vuetify 3
        </h1>

        <p class="text-h5 font-weight-light mb-3">
          The world's most popular Vue.js framework
        </p>

        <p class="text-body-1">
          For help and collaboration with other Vuetify developers,
          <br>please join our online
          <a href="https://community.vuetifyjs.com" target="_blank">Discord Community</a>
        </p>
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="text-h4 font-weight-bold mb-3">
          What's next?
        </h2>

        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title class="text-h5">
                Counter Example
              </v-card-title>
              <v-card-text class="text-h2">
                {{ counter }}
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="primary"
                  @click="counter++"
                >
                  Increment
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="counter--"
                >
                  Decrement
                </v-btn>
                <v-btn
                  @click="counter = 0"
                >
                  Reset
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="text-h4 font-weight-bold mb-3">
          Important Links
        </h2>

        <v-row justify="center">
          <a
            v-for="(link, i) in importantLinks"
            :key="i"
            :href="link.href"
            class="mx-3 text-decoration-none"
            target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  data: () => ({
    importantLinks: [
      {
        text: 'Documentation',
        href: 'https://vuetifyjs.com',
      },
      {
        text: 'GitHub',
        href: 'https://github.com/vuetifyjs/vuetify',
      },
      {
        text: 'Awesome Vuetify',
        href: 'https://github.com/vuetifyjs/awesome-vuetify',
      },
    ],
  }),
}
</script>
