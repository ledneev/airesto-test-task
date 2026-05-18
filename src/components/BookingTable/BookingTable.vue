<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useBookingStore } from "../../stores/bookingStore";
import { mergeEvents, positionEvents } from "../../utils/layout";
import {
  calcPosition,
  generateTimeSlots,
  getRestaurantTime,
  minutesToTimeString,
  timeStringToMinutes,
} from "../../utils/time";
import EventCard from "./EventCard.vue";

import SelectionOverlay from "./SelectionOverlay.vue";


const store = useBookingStore();

const tableRef = ref<HTMLElement>();
const headerRef = ref<HTMLElement>();
const containerWidth = ref(0);
const headerHeight = ref(0);

const SLOT_HEIGHT = 60;
const TIME_COL_WIDTH = 60;

const timeSlots = computed(() =>
  generateTimeSlots(
    store.restaurant.opening_time,
    store.restaurant.closing_time,
  ),
);

const columnHeight = computed(() => timeSlots.value.length * SLOT_HEIGHT);

const colWidth = computed(() => {
  const available = containerWidth.value - TIME_COL_WIDTH;
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
    localEvents: getLocalEventsForTable(table.id),
  })),
);

interface PositionedLocalEvent {
  id: string;
  top: number;
  height: number;
  fromTime: string;
  toTime: string;
  capacity: number;
  totalTables: number;
}

function getLocalEventsForTable(tableId: string): PositionedLocalEvent[] {
  const openingMin = timeStringToMinutes(store.restaurant.opening_time);
  const closingMin = timeStringToMinutes(store.restaurant.closing_time);

  return store
    .getLocalEventsFor(tableId, store.selectedDate)
    .map((e) => {
      const { top, height } = calcPosition(
        e.fromMinutes,
        e.toMinutes,
        openingMin,
        closingMin,
      );
      return {
        id: e.id,
        top,
        height,
        fromTime: minutesToTimeString(e.fromMinutes),
        toTime: minutesToTimeString(e.toMinutes),
        capacity: e.capacity,
        totalTables: e.tableIds.length,
      };
    });
}

function getMinutesFromMouseY(
  event: MouseEvent,
  colInner: HTMLElement,
): number {
  const rect = colInner.getBoundingClientRect();
  const percent = Math.max(

    0,
    Math.min(1, (event.clientY - rect.top) / rect.height),
  );
  const openingMin = timeStringToMinutes(store.restaurant.opening_time);
  const closingMin = timeStringToMinutes(store.restaurant.closing_time);
  const totalMin = closingMin - openingMin;
  const rawMinutes = openingMin + percent * totalMin;
  const SNAP_MIN = 5;
  return Math.round(rawMinutes / SNAP_MIN) * SNAP_MIN;
}

function handleColMousedown(
  event: MouseEvent,
  tableId: string,
  colInner: HTMLElement,
) {
  if ((event.target as HTMLElement).closest(".event-card")) return;

  event.preventDefault();
  const minutes = getMinutesFromMouseY(event, colInner);
  store.startSelection(tableId, minutes);
}

function handleColMousemove(
  event: MouseEvent,
  tableId: string,
  colInner: HTMLElement,
) {
  if (!store.selection.isSelecting) return;
  const minutes = getMinutesFromMouseY(event, colInner);
  store.updateSelection(tableId, minutes);
}

function handleMouseup() {
  if (store.selection.isSelecting) {
    store.confirmSelection();
  }
}

onMounted(async () => {
  await nextTick();

  if (!tableRef.value) return;

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === tableRef.value) {
        containerWidth.value = entry.contentRect.width;
      } else if (entry.target === headerRef.value) {
        headerHeight.value = entry.contentRect.height;
      }
    }
  });
  resizeObserver.observe(tableRef.value);
  if (headerRef.value) {
    headerHeight.value = headerRef.value.getBoundingClientRect().height;
    resizeObserver.observe(headerRef.value);
  }

  const openingSlot = timeSlots.value.findIndex(
    (slot) => slot === store.restaurant.opening_time,
  );
  if (openingSlot !== -1) {
    tableRef.value.scrollTop = openingSlot * SLOT_HEIGHT;
  }

  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60_000);

  document.addEventListener("mouseup", handleMouseup);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  clearInterval(timeInterval);
  document.removeEventListener("mouseup", handleMouseup);
});

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
let resizeObserver: ResizeObserver | null = null;

function scrollToEvent(id: string | number) {
  if (!tableRef.value) return;
  const eventElement = tableRef.value.querySelector(`[data-event-id="${id}"]`);
  if (!eventElement) return;
  const container = tableRef.value;
  const elementRect = eventElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  container.scrollTo({
    top: Math.max(
      0,
      container.scrollTop +
        elementRect.top -
        containerRect.top -
        containerRect.height / 2 +
        elementRect.height / 2,
    ),
    left: Math.max(
      0,
      container.scrollLeft +
        elementRect.left -
        containerRect.left -
        containerRect.width / 2 +
        elementRect.width / 2,
    ),
    behavior: "smooth",
  });
}

watch(
  () => store.scrollToEventId,
  (newId) => {
    if (newId) nextTick(() => scrollToEvent(newId));
  },
);
</script>

<template>
  <div class="booking-table">
    <div class="booking-table__scroll" ref="tableRef">
      <table class="booking-table__inner">
        <thead class="booking-table__head" ref="headerRef">
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
              v-for="{ table, events, localEvents } in tablesWithEvents"
              :key="table.id"
              class="booking-table__col"
              :style="{
                width: `${colWidth}px`,
                minWidth: `${colWidth}px`,
                '--col-width': `${colWidth}px`,
              }"
            >
              <div
                class="booking-table__col-inner"
                :style="{ height: `${columnHeight}px` }"
                @mousedown="
                  (e) =>
                    handleColMousedown(
                      e,
                      table.id,
                      e.currentTarget as HTMLElement,
                    )
                "
                @mousemove="
                  (e) =>
                    handleColMousemove(
                      e,
                      table.id,
                      e.currentTarget as HTMLElement,
                    )
                "
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

                <div
                  v-for="local in localEvents"
                  :key="local.id"
                  class="booking-table__local-event"
                  :style="{
                    top: `${local.top}%`,
                    height: `${local.height}%`,
                  }"
                  :title="`Бронь ${local.fromTime}–${local.toTime}`"
                >
                  <button
                    class="booking-table__local-event-remove"
                    type="button"
                    title="Удалить"
                    @mousedown.stop
                    @click.stop="store.removeLocalEvent(local.id)"
                  >
                    ×
                  </button>
                  <span class="booking-table__local-event-title">Бронь</span>
                  <span class="booking-table__local-event-time">
                    {{ local.fromTime }}–{{ local.toTime }}
                  </span>
                  <span
                    v-if="local.height > 4"
                    class="booking-table__local-event-meta"
                  >
                    {{ local.capacity }} чел<template v-if="local.totalTables > 1">
                      · {{ local.totalTables }} ст.</template>
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <SelectionOverlay
        :column-height="columnHeight"
        :col-width="colWidth"
        :time-col-width="TIME_COL_WIDTH"
        :header-height="headerHeight"
      />
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
  position: relative;
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

.booking-table__local-event {
  position: absolute;
  left: 2px;
  right: 2px;
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid #3b82f6;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 11px;
  line-height: 14px;
  color: var(--color-text);
  z-index: 4;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.booking-table__local-event-title {
  font-weight: 600;
}

.booking-table__local-event-time {
  color: var(--color-text-muted);
  font-size: 10px;
}

.booking-table__local-event-meta {
  color: var(--color-text-muted);
  font-size: 10px;
}

.booking-table__local-event-remove {
  position: absolute;
  top: 2px;
  right: 4px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 2px;
}

.booking-table__local-event-remove:hover {
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text);
}
</style>
