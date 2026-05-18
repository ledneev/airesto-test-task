<script setup lang="ts">
import { useBookingStore } from '../stores/bookingStore'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const store = useBookingStore()
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 590
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function formatDay(dateStr: string): { date: string; label: string } {
  const date = new Date(dateStr)
  const today = new Date(store.data.current_day)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  let label = ''
  if (dateStr === store.data.current_day) {
    label = 'сегодня'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    label = 'завтра'
  } else {
    label = date.toLocaleDateString('ru-RU', { weekday: 'long' })
  }

  return { date: day, label }
}

const displayedDates = computed(() => {
  const allDates = store.availableDays
  const selectedIndex = allDates.indexOf(store.selectedDate)

  if (!isMobile.value || allDates.length <= 3) {
    return allDates
  }

  let startIndex = Math.max(0, selectedIndex - 1)
  let endIndex = startIndex + 2

  if (endIndex >= allDates.length) {
    endIndex = allDates.length - 1
    startIndex = Math.max(0, endIndex - 2)
  }
  
  return allDates.slice(startIndex, endIndex + 1)
})
const hasDatesBefore = computed(() => {
  if (!isMobile.value) return false
  const allDates = store.availableDays
  const displayed = displayedDates.value
  return allDates.indexOf(displayed[0]) > 0
})

const hasDatesAfter = computed(() => {
  if (!isMobile.value) return false
  const allDates = store.availableDays
  const displayed = displayedDates.value
  return allDates.indexOf(displayed[displayed.length - 1]) < allDates.length - 1
})

function navigateLeft() {
  const allDates = store.availableDays
  const currentFirst = displayedDates.value[0]
  const currentIndex = allDates.indexOf(currentFirst)
  
  if (currentIndex > 0) {
    const newIndex = Math.max(0, currentIndex - 1)
    store.selectDate(allDates[newIndex])
  }
}

function navigateRight() {
  const allDates = store.availableDays
  const currentLast = displayedDates.value[displayedDates.value.length - 1]
  const currentIndex = allDates.indexOf(currentLast)
  
  if (currentIndex < allDates.length - 1) {
    const newIndex = Math.min(allDates.length - 1, currentIndex + 1)
    store.selectDate(allDates[newIndex])
  }
}
</script>

<template>
  <div class="date-picker">
    <span class="date-picker__label">Дата</span>
    <div class="date-picker__list">
      <button
        v-if="hasDatesBefore"
        class="date-picker__nav date-picker__nav--left"
        @click="navigateLeft"
        aria-label="Предыдущие даты"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <button
        v-for="day in displayedDates"
        :key="day"
        class="date-picker__btn"
        :class="{ 'date-picker__btn--active': day === store.selectedDate }"
        @click="store.selectDate(day)"
      >
        <span class="date-picker__date">{{ formatDay(day).date }}</span>
        <span class="date-picker__sublabel">{{ formatDay(day).label }}</span>
      </button>

      <button
        v-if="hasDatesAfter"
        class="date-picker__nav date-picker__nav--right"
        @click="navigateRight"
        aria-label="Следующие даты"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-picker__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.date-picker__list {
  display: flex;
  gap: 4px;
  align-items: center;
}

.date-picker__btn {
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  min-width: 100px;
  flex: 1;
}

.date-picker__btn:hover {
  background: var(--color-bg-hover);
}

.date-picker__btn--active {
  background: var(--color-accent);
  color: #fff;
}

.date-picker__btn--active:hover {
  background: var(--color-accent);
}

.date-picker__date {
  font-size: 14px;
  font-weight: 500;
}

.date-picker__sublabel {
  font-size: 12px;
  opacity: 0.8;
}

.date-picker__nav {
  display: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}

.date-picker__nav:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-accent);
}

.date-picker__nav svg {
  stroke: currentColor;
}

@media (max-width: 768px) {
  .date-picker .date-picker__list {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    gap: 8px;
    max-width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
  }

  .date-picker .date-picker__btn {
    min-width: 70px;
    padding: 6px 8px;
    flex-shrink: 0;
    height: auto;
    flex: 0 0 auto;
  }

  .date-picker .date-picker__date {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
  }

  .date-picker .date-picker__sublabel {
    font-size: 10px;
    opacity: 0.7;
    line-height: 1.1;
  }

  .date-picker__nav {
    display: flex;
  }
}

@media (max-width: 590px) {
  .date-picker .date-picker__list {
    gap: 6px;
  }

  .date-picker .date-picker__btn {
    min-width: 68px;
    padding: 5px 7px;
  }

  .date-picker .date-picker__date {
    font-size: 11px;
    font-weight: 600;
  }

  .date-picker .date-picker__sublabel {
    font-size: 9px;
    opacity: 0.7;
  }

  .date-picker__nav {
    width: 30px;
    height: 30px;
  }

  .date-picker__nav svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .date-picker .date-picker__list {
    gap: 6px;
  }

  .date-picker .date-picker__btn {
    min-width: 65px;
    padding: 5px 6px;
  }

  .date-picker .date-picker__date {
    font-size: 11px;
  }

  .date-picker .date-picker__sublabel {
    font-size: 9px;
  }

  .date-picker__nav {
    width: 28px;
    height: 28px;
  }

  .date-picker__nav svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 360px) {
  .date-picker .date-picker__btn {
    min-width: 60px;
    padding: 4px 5px;
  }

  .date-picker .date-picker__date {
    font-size: 10px;
  }

  .date-picker .date-picker__sublabel {
    font-size: 8px;
  }

  .date-picker__nav {
    width: 24px;
    height: 24px;
  }

  .date-picker__nav svg {
    width: 12px;
    height: 12px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .date-picker .date-picker__btn {
    min-height: 44px;
    min-width: 70px;
  }
}
</style>