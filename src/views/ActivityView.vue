<template>
  <v-container class="fill-height align-start">
    <v-card class="w-100 h-100 d-flex flex-column">
      <v-card-title class="d-flex justify-space-between align-center py-3">
        Activity Log
        <div class="d-flex align-center" style="width: 300px">
          <v-text-field
            v-model="search"
            label="Filter Activities"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            placeholder="Search..."
          ></v-text-field>
          <v-btn icon="mdi-refresh" variant="text" class="ml-2" @click="refreshData" :loading="initialLoading"></v-btn>
        </div>
      </v-card-title>
      
      <v-divider></v-divider>

      <div class="flex-grow-1" style="overflow: hidden; position: relative;">
        <v-infinite-scroll 
          height="100%" 
          :items="visibleActivities" 
          @load="loadMore"
        >
          <template v-for="item in visibleActivities" :key="item._id">
            <div class="py-2 px-4 border-b font-mono text-body-2 hover-bg">
              <span>{{ formatTime(item.createdAt) }}</span>
              <span class="ml-2">{{ getTypeEmoji(item.type) }}</span>
              <span class="ml-2">{{ item.activity }}</span>
              <span 
                class="text-primary ml-2 cursor-pointer text-decoration-underline" 
                @click="openDetails(item)"
              >(details)</span>
            </div>
          </template>
          <template v-slot:empty>
            <div class="pa-4 text-center text-medium-emphasis">No more activities</div>
          </template>
        </v-infinite-scroll>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="900px">
      <v-card>
        <v-card-title>Activity Details</v-card-title>
        <v-card-text class="pt-4">
          <v-row v-if="isUpdate">
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Aut</h3>
              <v-sheet border rounded class="pa-2" style="max-height: 500px; overflow-y: auto;">
                <div class="diff-view">
                  <div 
                    v-for="(line, index) in diffLines.old" 
                    :key="index"
                    :class="['diff-line', line.removed ? 'diff-removed' : 'diff-unchanged']"
                  >
                    <span class="diff-marker">{{ line.removed ? '-' : ' ' }}</span>
                    <span class="diff-content">{{ line.content }}</span>
                  </div>
                </div>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Neu</h3>
              <v-sheet border rounded class="pa-2" style="max-height: 500px; overflow-y: auto;">
                <div class="diff-view">
                  <div 
                    v-for="(line, index) in diffLines.new" 
                    :key="index"
                    :class="['diff-line', line.added ? 'diff-added' : 'diff-unchanged']"
                  >
                    <span class="diff-marker">{{ line.added ? '+' : ' ' }}</span>
                    <span class="diff-content">{{ line.content }}</span>
                  </div>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
          <v-row v-else-if="isCreate">
            <v-col cols="12">
              <v-sheet border rounded class="pa-3 bg-grey-lighten-4" style="max-height: 500px; overflow-y: auto; overflow-x: auto;">
                <pre class="text-caption ma-0" style="white-space: pre; word-break: normal; overflow-wrap: normal;">{{ formatDump(selectedItem?.dump_new) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>
          <v-row v-else-if="isDelete">
            <v-col cols="12">
              <v-sheet border rounded class="pa-3 bg-grey-lighten-4" style="max-height: 500px; overflow-y: auto; overflow-x: auto;">
                <pre class="text-caption ma-0" style="white-space: pre; word-break: normal; overflow-wrap: normal;">{{ formatDump(selectedItem?.dump_old) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>
          <v-row v-else>
             <v-col cols="12">
                <div class="text-caption text-medium-emphasis">No details available</div>
             </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { apiService } from '@/services/apiService';
import type { ActivityLogEntry } from '@/types';
import * as Diff from 'diff';

const allActivities = ref<ActivityLogEntry[]>([]);
const visibleActivities = ref<ActivityLogEntry[]>([]);
const search = ref('');
const initialLoading = ref(false);
const dialog = ref(false);
const selectedItem = ref<ActivityLogEntry | null>(null);

const PAGE_SIZE = 20;

interface SideDiffLine {
  content: string;
  added?: boolean;
  removed?: boolean;
}

const isUpdate = computed(() => {
  if (!selectedItem.value) return false;
  const act = (selectedItem.value.activity || '').toLowerCase();
  const type = (selectedItem.value.type || '').toLowerCase();
  // Check for 'update', or if both dumps are present
  if (act.includes('update') || type.includes('update')) return true;
  return !!selectedItem.value.dump_old && !!selectedItem.value.dump_new;
});

const isCreate = computed(() => {
  if (!selectedItem.value) return false;
  const act = (selectedItem.value.activity || '').toLowerCase();
  const type = (selectedItem.value.type || '').toLowerCase();
  // Check for 'create', 'add', or if only new dump is present
  if (act.includes('create') || act.includes('add') || type.includes('create') || type.includes('add')) return true;
  return !selectedItem.value.dump_old && !!selectedItem.value.dump_new;
});

const isDelete = computed(() => {
  if (!selectedItem.value) return false;
  const act = (selectedItem.value.activity || '').toLowerCase();
  const type = (selectedItem.value.type || '').toLowerCase();
  // Check for 'delete', 'remove', or if only old dump is present
  if (act.includes('delete') || act.includes('remove') || type.includes('delete') || type.includes('remove')) return true;
  return !!selectedItem.value.dump_old && !selectedItem.value.dump_new;
});

const filteredActivities = computed(() => {
  if (!search.value) return allActivities.value;
  const searchLower = search.value.toLowerCase();
  return allActivities.value.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchLower)
    )
  );
});

const diffLines = computed(() => {
  if (!selectedItem.value || !isUpdate.value) return { old: [], new: [] };
  
  const oldDump = selectedItem.value.dump_old;
  const newDump = selectedItem.value.dump_new;
  
  if (!oldDump || !newDump) return { old: [], new: [] };
  
  try {
    const oldObj = JSON.parse(oldDump);
    const newObj = JSON.parse(newDump);
    
    const changes = Diff.diffJson(oldObj, newObj);
    
    const oldResult: SideDiffLine[] = [];
    const newResult: SideDiffLine[] = [];
    
    for (const change of changes) {
      const lines = change.value.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      if (change.added) {
        for (const line of lines) {
          newResult.push({ content: line, added: true });
          oldResult.push({ content: '' });
        }
      } else if (change.removed) {
        for (const line of lines) {
          oldResult.push({ content: line, removed: true });
          newResult.push({ content: '' });
        }
      } else {
        for (const line of lines) {
          oldResult.push({ content: line });
          newResult.push({ content: line });
        }
      }
    }
    
    return { old: oldResult, new: newResult };
  } catch (e) {
    const oldFormatted = formatDump(oldDump);
    const newFormatted = formatDump(newDump);
    
    const changes = Diff.diffLines(oldFormatted, newFormatted);
    
    const oldResult: SideDiffLine[] = [];
    const newResult: SideDiffLine[] = [];
    
    for (const change of changes) {
      const lines = change.value.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      if (change.added) {
        for (const line of lines) {
          newResult.push({ content: line, added: true });
          oldResult.push({ content: '' });
        }
      } else if (change.removed) {
        for (const line of lines) {
          oldResult.push({ content: line, removed: true });
          newResult.push({ content: '' });
        }
      } else {
        for (const line of lines) {
          oldResult.push({ content: line });
          newResult.push({ content: line });
        }
      }
    }
    
    return { old: oldResult, new: newResult };
  }
});

async function refreshData() {
  initialLoading.value = true;
  try {
    const data = await apiService.getActivityLog();
    allActivities.value = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // Reset visible list
    visibleActivities.value = [];
    // The infinite scroll will automatically trigger loadMore or we can init manually
    // But since visibleActivities is empty, infinite-scroll usually triggers initial load
  } catch (error) {
    console.error('Failed to fetch activity log', error);
  } finally {
    initialLoading.value = false;
  }
}

// Infinite scroll load handler
async function loadMore({ done }: { done: (status: 'ok' | 'empty' | 'error') => void }) {
  if (initialLoading.value) {
    done('ok');
    return;
  }

  const currentLength = visibleActivities.value.length;
  const totalLength = filteredActivities.value.length;
  
  if (currentLength >= totalLength) {
    done('empty');
    return;
  }

  const nextBatch = filteredActivities.value.slice(currentLength, currentLength + PAGE_SIZE);
  visibleActivities.value.push(...nextBatch);
  done('ok');
}

// Reset list when search changes
watch(search, () => {
  visibleActivities.value = [];
  // We need to trigger a load, but typically v-infinite-scroll does this if the list becomes empty or short.
  // Manually adding first batch to ensure immediate feedback
  const firstBatch = filteredActivities.value.slice(0, PAGE_SIZE);
  visibleActivities.value = firstBatch;
});

function openDetails(item: ActivityLogEntry) {
  selectedItem.value = item;
  dialog.value = true;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function getTypeEmoji(type: string): string {
  const typeUpper = type.toUpperCase();
  switch (typeUpper) {
    case 'CREATE':
      return '➕';
    case 'UPDATE':
      return '✏️';
    case 'DELETE':
      return '🗑️';
    default:
      return '📝';
  }
}

function formatDump(dump: string | undefined): string {
  if (!dump) return 'N/A';
  try {
    const parsed = JSON.parse(dump);
    // Check if the parsed object is nested under a property and unwrap if needed
    // But for activity logs, we want to show the full structure as-is
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If it's not valid JSON, return as-is
    return dump;
  }
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.font-mono {
  font-family: 'Roboto Mono', monospace;
}
.cursor-pointer {
  cursor: pointer;
}
.hover-bg:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

.diff-view {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

.diff-line {
  padding: 2px 8px;
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-marker {
  display: inline-block;
  width: 20px;
  font-weight: bold;
  user-select: none;
}

.diff-content {
  margin-left: 4px;
}

.diff-removed {
  background-color: #ffebee;
  color: #c62828;
}

.diff-removed .diff-marker {
  color: #c62828;
}

.diff-added {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.diff-added .diff-marker {
  color: #2e7d32;
}

.diff-unchanged {
  background-color: transparent;
  color: inherit;
}
</style>
