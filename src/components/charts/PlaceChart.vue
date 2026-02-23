<template>
  <apexchart
    type="pie"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: Array<{
    label: string;
    count: number;
    color: string;
  }>;
}>();

const series = computed(() => props.data.map(stat => stat.count));

const chartOptions = computed(() => ({
  chart: {
    height: 350,
    type: 'pie',
    background: 'transparent'
  },
  labels: props.data.map(stat => stat.label),
  colors: props.data.map(stat => stat.color),
  title: {
    // text: 'Participant Cities Distribution',
    align: 'center',
    style: {
      color: 'rgb(var(--v-theme-on-surface))'
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val.toFixed(1) + "%"
    }
  },
  legend: {
    position: 'left',
    labels: {
      colors: 'rgb(var(--v-theme-on-surface))'
    },
    formatter: function (seriesName: string, opts: any) {
      const count = opts.w.globals.series[opts.seriesIndex];
      const total = opts.w.globals.series.reduce((a: number, b: number) => a + b, 0);
      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
      return `${seriesName} ${count} (${percent}%)`;
    }
  },
  theme: {
    mode: 'dark'
  }
}));
</script>
