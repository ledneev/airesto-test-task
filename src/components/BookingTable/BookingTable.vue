<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useBookingStore } from "../../stores/bookingStore";
import { mergeEvents, positionEvents } from "../../utils/layout";
import {
  generateTimeSlots,
  getRestaurantTime,
  timeStringToMinutes,
} from "../../utils/time";
import EventCard from "./EventCard.vue";

const store = useBookingStore();

const tableRef = ref<HTMLElement>();
const containerWidth = ref(0);

const SLOT_HEIGHT = 60;

const timeSlots = computed(() =>
  generateTimeSlots(
    store.restaurant.opening_time,
    store.restaurant.closing_time,
  ),
);

const columnHeight = computed(() => timeSlots.value.length * SLOT_HEIGHT);

const colWidth = computed(() => {
  const timeColWidth = 60;
  const available = containerWidth.value - timeColWidth;
  const count = tablesWithEvents.value.length;
  if (count === 0) return 160;
  return Math.max(120, available / count);
});

const tablesWithEvents = computed(() =>
  store.filteredTables.map((table) => ({
    table,
    events: positionEvents(
      mergeEvents(table, store.selectedDate),
      store.restaurant.opening_time,
      store.restaurant.closing_time,
      store.restaurant.timezone,
    ),
  })),
);

let resizeObserver: ResizeObserver | null = null;

const currentTimePercent = ref<number | null>(null);

function updateCurrentTime() {
  const now = getRestaurantTime(store.restaurant.timezone);
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMin = hours * 60 + minutes;

  const openingMin = timeStringToMinutes(store.restaurant.opening_time);
  const closingMin = timeStringToMinutes(store.restaurant.closing_time);


  if (currentMin < openingMin || currentMin > closingMin) {
    currentTimePercent.value = null;
    return;
  }

  currentTimePercent.value =
    ((currentMin - openingMin) / (closingMin - openingMin)) * 100;
}

let timeInterval: ReturnType<typeof setInterval>;

function scrollToEvent(id: string | number) {
  if (!tableRef.value) return;

  const eventElement = tableRef.value.querySelector(`[data-event-id="${id}"]`);
  if (!eventElement) return;

  const container = tableRef.value;
  const elementRect = eventElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate scroll adjustments
  const scrollTop = container.scrollTop;
  const scrollLeft = container.scrollLeft;

  const targetScrollTop = scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);
  const targetScrollLeft = scrollLeft + (elementRect.left - containerRect.left) - (containerRect.width / 2) + (elementRect.width / 2);

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    left: Math.max(0, targetScrollLeft),
    behavior: 'smooth'
  });
}

watch(() => store.scrollToEventId, (newId) => {
  if (newId) {
    nextTick(() => {
      scrollToEvent(newId);
    });
  }
});

onMounted(async () => {
  await nextTick();

  if (!tableRef.value) return;

  resizeObserver = new ResizeObserver((entries) => {
    containerWidth.value = entries[0].contentRect.width;
  });
  resizeObserver.observe(tableRef.value);

  const openingSlot = timeSlots.value.findIndex(
    (slot) => slot === store.restaurant.opening_time,
  );
  if (openingSlot !== -1) {
    tableRef.value.scrollTop = openingSlot * SLOT_HEIGHT;
  }

  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60_000);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  clearInterval(timeInterval);
});
</script>

<template>
  <div class="booking-table">
    <div class="booking-table__scroll" ref="tableRef">
      <table class="booking-table__inner">
        <thead class="booking-table__head">
          <tr>
            <th class="booking-table__time-header"></th>
            <th
              v-for="{ table } in tablesWithEvents"
              :key="table.id"
              class="booking-table__col-header"
              :style="{ width: `${colWidth}px`, minWidth: `${colWidth}px` }"
            >
              <span class="booking-table__table-number"
                >#{{ table.number }}</span
              >
              <span class="booking-table__table-capacity"
                >{{ table.capacity }} чел</span
              >
              <span class="booking-table__table-zone">{{ table.zone }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td class="booking-table__time-col">
              <div
                class="booking-table__time-slots"
                :style="{ height: `${columnHeight}px` }"
              >
                <div
                  v-for="slot in timeSlots"
                  :key="slot"
                  class="booking-table__time-slot"
                  :style="{ height: `${SLOT_HEIGHT}px` }"
                >
                  {{ slot }}
                </div>
              </div>
            </td>

            <td
              v-for="{ table, events } in tablesWithEvents"
              :key="table.id"
              class="booking-table__col"
              :style="{ width: `${colWidth}px`, minWidth: `${colWidth}px` }"
            >
              <div
                class="booking-table__col-inner"
                :style="{ height: `${columnHeight}px` }"
              >
                <div
                  v-for="slot in timeSlots"
                  :key="slot"
                  class="booking-table__grid-line"
                  :style="{ height: `${SLOT_HEIGHT}px` }"
                />

                <div
                  v-if="currentTimePercent !== null"
                  class="booking-table__current-time"
                  :style="{ top: `${currentTimePercent}%` }"
                />

                <EventCard
                  v-for="event in events"
                  :key="event.id"
                  :event="event"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.booking-table {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.booking-table__scroll {
  overflow: auto;
  height: 100%;
  width: 100%;
}

.booking-table__inner {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  min-width: max-content;
}

.booking-table__head {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg);
}

.booking-table__time-header {
  width: 60px;
  min-width: 60px;
  position: sticky;
  left: 0;
  background: var(--color-bg);
  z-index: 20;
}

.booking-table__col-header {
  padding: 8px 12px;
  text-align: left;
  border-left: 1px solid var(--color-border);
  font-weight: 400;
  background: var(--color-bg);
}

.booking-table__table-number {
  display: block;
  font-weight: 600;
  font-size: 13px;
}

.booking-table__table-capacity,
.booking-table__table-zone {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
}

.booking-table__time-col {
  position: sticky;
  left: 0;
  z-index: 5;
  background: var(--color-bg);
  width: 60px;
  min-width: 60px;
  vertical-align: top;
}

.booking-table__time-slots {
  position: relative;
}

.booking-table__time-slot {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
  padding-right: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
}

.booking-table__col {
  vertical-align: top;
  border-left: 1px solid var(--color-border);
}

.booking-table__col-inner {
  position: relative;
  width: 100%;
}

.booking-table__grid-line {
  border-top: 1px solid var(--color-border);
  width: 100%;
}

.booking-table__current-time {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #ef4444;
  z-index: 6;
  pointer-events: none;
}

.booking-table__current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #ef4444;
  pointer-events: none;
}
</style>
