import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#d12662',
          secondary: '#b8a4abff',
          accent: '#FF4081',
          error: '#f44336',
          warning: '#ff9800',
          info: '#2196f3',
          success: '#4caf50',
          background: '#ffffff',
          surface: '#f5f5f5',
        },
      },
      dark: {
        colors: {
          primary: '#d12662',
          secondary: '#181a1f',
          accent: '#FF4081',
          error: '#ff5252',
          warning: '#ffb74d',
          info: '#64b5f6',
          success: '#81c784',
          background: '#121212',
          surface: '#1e1e1e',
        },
      },
    },
  },
})
