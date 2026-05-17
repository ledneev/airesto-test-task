<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useBookingStore } from '../../stores/bookingStore'
import { mergeEvents, positionEvents } from '../../utils/layout'
import { generateTimeSlots } from '../../utils/time'
import EventCard from './EventCard.vue'

const store = useBookingStore()

const timeSlots = computed(() =>
  generateTimeSlots(
    store.restaurant.opening_time,
    store.restaurant.closing_time,
  )
)

const tablesWithEvents = computed(() =>
  store.filteredTables.map(table => ({
    table,
    events: positionEvents(
      mergeEvents(table, store.selectedDate),
      store.restaurant.opening_time,
      store.restaurant.closing_time,
      store.restaurant.timezone,
    ),
  }))
)

const scrollContainer = ref<HTMLElement>()

  onMounted(async () => {
  await nextTick()
  if (!scrollContainer.value) return

  const openingSlot = timeSlots.value.findIndex(
    slot => slot === store.restaurant.opening_time
  )
  if (openingSlot !== -1) {
    scrollContainer.value.scrollTop = openingSlot * SLOT_HEIGHT
  }
})

const SLOT_HEIGHT = 60
const columnHeight = computed(() => timeSlots.value.length * SLOT_HEIGHT)
</script>

<template>
  <div class="booking-table">

    <div class="booking-table__scroll" ref="scrollContainer">
      <table class="booking-table__inner">

        <thead class="booking-table__head">
          <tr>
            <th class="booking-table__time-header"></th>

            <th
              v-for="{ table } in tablesWithEvents"
              :key="table.id"
              class="booking-table__col-header"
            >
              <span class="booking-table__table-number">#{{ table.number }}</span>
              <span class="booking-table__table-capacity">{{ table.capacity }} чел</span>
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
}

.booking-table__scroll {
  overflow: auto;
  height: 100%;
  width: 100%;
}

.booking-table__inner {
  border-collapse: collapse;
  table-layout: fixed;
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
  width: 160px;
  min-width: 160px;
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
  text-align: right;
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
}

.booking-table__col {
  vertical-align: top;
  border-left: 1px solid var(--color-border);
  width: auto;
  min-width: 160px;
}

.booking-table__col-inner {
  position: relative;
  width: 100%;
}

.booking-table__grid-line {
  border-top: 1px solid var(--color-border);
  width: 100%;
}
</style>