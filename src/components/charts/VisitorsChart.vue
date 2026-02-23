<template>
  <apexchart
    type="line"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: Array<{
    monthName: string;
    year: number;
    avgVisitors: number;
  }>;
}>();

const series = computed(() => [{
  name: "⌀ Bsuecher",
  data: props.data.map(item => item.avgVisitors)
}]);

const chartOptions = computed(() => ({
  chart: {
    height: 350,
    type: 'line',
    background: 'transparent',
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#d12662']
    }
  },
  stroke: {
    curve: 'smooth',
    colors: ['#d12662'],
    width: 3
  },
  title: {
    // text: 'Average Visitors per Month',
    align: 'center',
    style: {
      color: 'rgb(var(--v-theme-on-surface))'
    }
  },
  grid: {
    row: {
      colors: ['transparent', 'transparent'], 
      opacity: 0.5
    },
    borderColor: '#e0e0e0'
  },
  xaxis: {
    categories: props.data.map(item => `${item.monthName} ${item.year}`),
    labels: {
      style: {
        colors: 'rgb(var(--v-theme-on-surface))'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: 'rgb(var(--v-theme-on-surface))'
      }
    }
  },
  theme: {
    mode: 'dark' // Since default theme in Vuetify seems to be dark based on vuetify.ts
  },
  colors: ['#d12662']
}));
</script>
