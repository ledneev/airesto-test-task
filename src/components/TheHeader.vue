<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useBookingStore } from "../stores/bookingStore";
import type { CalendarEvent } from '../types';

const store = useBookingStore();

const isDark = ref(true);

function toggleTheme() {
  isDark.value = !isDark.value;
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.remove('theme-light');
  } else {
    html.classList.add('theme-light');
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    isDark.value = false;
    document.documentElement.classList.add('theme-light');
  }
});

const searchQuery = ref('');
const showSuggestions = ref(false);

const allEvents = computed<CalendarEvent[]>(() => {
  const events: CalendarEvent[] = [];
  store.data.tables.forEach(table => {
    table.orders.forEach(order => {
      if (order.start_time.startsWith(store.selectedDate)) {
        events.push({
          id: order.id,
          type: 'order',
          status: order.status,
          start_time: order.start_time,
          end_time: order.end_time,
        });
      }
    });
    table.reservations.forEach(reservation => {
      if (reservation.seating_time.startsWith(store.selectedDate)) {
        events.push({
          id: reservation.id,
          type: 'reservation',
          status: reservation.status,
          start_time: reservation.seating_time,
          end_time: reservation.end_time,
          name: reservation.name_for_reservation,
          num_people: reservation.num_people,
          phone_number: reservation.phone_number,
        });
      }
    });
  });
  console.log('All events for selected date:', events.length, events);
  return events;
});

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];
  const filtered = allEvents.value.filter(event =>
    event.name?.toLowerCase().includes(query)
  );
  console.log('Search query:', query, 'filtered events:', filtered);
  return filtered;
});

function selectEvent(event: CalendarEvent) {
  searchQuery.value = event.name || '';
  showSuggestions.value = false;
  store.setSearchedEventId(event.id);
  store.requestScrollToEvent(event.id);
  console.log('Selected event:', event);
}

function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    store.setSearchedEventId(null);
  }
});
</script>

<template>
  <header class="header">
    <div class="header__brand">
      <span class="header__logo"> AIRESTO </span>
      <span class="header__separator">|</span>
      <span class="header__restaurant">
        {{ store.restaurant.restaurant_name }}
      </span>
    </div>

    <div class="header__actions">
      <div class="header__search-wrapper" style="position: relative; margin-right: 5px;">
        <div class="header__search">
          <img src="../assets/img/search.svg" alt="Поиск" class="header__search-icon" />
          <input
            v-model="searchQuery"
            @focus="showSuggestions = true"
            @blur="handleBlur"
            type="text"
            placeholder="⌘+Л поиск по имени"
            class="header__search-input"
          />
        </div>
        <div v-if="showSuggestions && filteredEvents.length > 0" class="header__suggestions">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="header__suggestion-item"
            @mousedown="selectEvent(event)"
          >
            <span class="header__suggestion-name">{{ event.name }}</span>
            <span class="header__suggestion-details">
              {{ event.type === 'reservation' ? 'Бронь' : 'Заказ' }} • {{ event.num_people }} чел
            </span>
          </div>
        </div>
      </div>
      <button class="header__btn" @click="toggleTheme" title="Переключить тему">
        <img src="../assets/img/theme.svg" alt="Переключить тему" />
      </button>
      <button class="header__btn">
        <img src="../assets/img/exit.svg" alt="" aria-hidden="true" />
        <span>Выйти</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.header__separator {
  color: var(--color-text-muted);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s;
}

.header__btn:hover {
  background: var(--color-bg-hover);
}

.header__btn:first-child img {
  width: 24px;
  height: 24px;
}

.header__search-wrapper {
  position: relative;
}

.header__search {
  display: flex;
  align-items: center;
  background: #1B1B1D;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 12px;
  gap: 8px;
  width: 280px;
  transition: border-color 0.2s;
}

.header__search:focus-within {
  border-color: var(--color-accent);
}

.header__search-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.header__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
}

.header__search-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.header__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.header__suggestions::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.header__suggestions::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 5px;
}

.header__suggestions::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.header__suggestions::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
  border: 2px solid transparent;
  background-clip: content-box;
}

.header__suggestions::-webkit-scrollbar-corner {
  background: transparent;
}

.header__suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.2s;
}

.header__suggestion-item:last-child {
  border-bottom: none;
}

.header__suggestion-item:hover {
  background: var(--color-bg-hover);
}

.header__suggestion-name {
  display: block;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

.header__suggestion-details {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>