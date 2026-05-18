<script setup lang="ts">
import { useBookingStore } from '../stores/bookingStore'

const store = useBookingStore()

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
</script>

<template>
  <div class="date-picker">
    <span class="date-picker__label">Дата</span>
    <div class="date-picker__list">
      <button
        v-for="day in store.availableDays"
        :key="day"
        class="date-picker__btn"
        :class="{ 'date-picker__btn--active': day === store.selectedDate }"
        @click="store.selectDate(day)"
      >
        <span class="date-picker__date">{{ formatDay(day).date }}</span>
        <span class="date-picker__sublabel">{{ formatDay(day).label }}</span>
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

@media (max-width: 768px) {
  .date-picker .date-picker__list {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    gap: 4px;
    max-width: 100%;
    display: flex;
    flex-wrap: nowrap;
  }

  .date-picker .date-picker__btn {
    min-width: 70px;
    padding: 6px 8px;
    flex-shrink: 0;
    height: auto;
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
}

@media (max-width: 480px) {
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
}

@media (hover: none) and (pointer: coarse) {
  .date-picker .date-picker__btn {
    min-height: 44px;
    min-width: 70px;
  }
}
</style>