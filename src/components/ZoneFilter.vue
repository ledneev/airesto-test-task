<script setup lang="ts">
import { useBookingStore } from '../stores/bookingStore'
import type { Zone } from '../types'

const store = useBookingStore()
</script>

<template>
  <div class="zone-filter">
    <span class="zone-filter__label">Отображаемые зоны</span>
    <div class="zone-filter__list">
      <button
        v-for="zone in store.allZones"
        :key="zone"
        class="zone-filter__btn"
        :class="{ 'zone-filter__btn--active': store.isZoneActive(zone as Zone) }"
        @click="store.toggleZone(zone as Zone)"
      >
        {{ zone }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.zone-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zone-filter__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.zone-filter__list {
  display: flex;
  gap: 8px;
}

.zone-filter__btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s, border-color 0.2s;
}

.zone-filter__btn:hover {
  border-color: var(--color-accent);
}

.zone-filter__btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
</style>