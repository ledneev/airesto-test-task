<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '../../stores/bookingStore'
import { minutesToTimeString, timeStringToMinutes } from '../../utils/time'

const store = useBookingStore()

const props = defineProps<{
  columnHeight: number
  colWidth: number
  timeColWidth: number
}>()

const range = computed(() => store.selectionRange)

const overlayStyle = computed(() => {
  const r = range.value
  if (!r) return null

  const openingMin = timeStringToMinutes(store.restaurant.opening_time)
  const closingMin = timeStringToMinutes(store.restaurant.closing_time)
  const totalMin = closingMin - openingMin

  const top = ((r.fromMinutes - openingMin) / totalMin) * 100
  const height = ((r.toMinutes - r.fromMinutes) / totalMin) * 100
  const left = props.timeColWidth + r.fromTableIdx * props.colWidth
  const width = (r.toTableIdx - r.fromTableIdx + 1) * props.colWidth

  return { top, height, left, width }
})

const selectedTables = computed(() => {
  if (!range.value) return []
  return range.value.tableIds.map(id =>
    store.filteredTables.find(t => t.id === id)
  ).filter(Boolean)
})

const totalCapacity = computed(() =>
  selectedTables.value.reduce((sum, t) => sum + (t?.capacity ?? 0), 0)
)

const fromTimeStr = computed(() =>
  range.value ? minutesToTimeString(range.value.fromMinutes) : ''
)

const toTimeStr = computed(() =>
  range.value ? minutesToTimeString(range.value.toMinutes) : ''
)

const durationStr = computed(() => {
  if (!range.value) return ''
  const diff = range.value.toMinutes - range.value.fromMinutes
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
})

const selectedDate = computed(() => {
  const d = new Date(store.selectedDate)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
})

function handleCreate() {
  if (!range.value) return

  console.log('=== Новое бронирование ===')
  console.log('ID столов:', range.value.tableIds)
  console.log('Время начала:', fromTimeStr.value)
  console.log('Время окончания:', toTimeStr.value)

  // Сохраняем в store
  store.addLocalEvent({
    tableIds: range.value.tableIds,
    fromMinutes: range.value.fromMinutes,
    toMinutes: range.value.toMinutes,
    date: store.selectedDate,
  })

  store.cancelSelection()
}

function handleCancel() {
  store.cancelSelection()
}
</script>

<template>
  <template v-if="overlayStyle && range">

    <div
      class="selection-overlay"
      :class="{ 'selection-overlay--confirming': store.selection.isConfirming }"
      :style="{
        position: 'absolute',
        top: `${overlayStyle.top}%`,
        height: `${overlayStyle.height}%`,
        left: `${overlayStyle.left}px`,
        width: `${overlayStyle.width}px`,
        pointerEvents: 'none',
        zIndex: 50,
      }"
    />

    <div
      v-if="store.selection.isConfirming"
      class="selection-popup"
      :style="{
        position: 'absolute',
        top: `${overlayStyle.top}%`,
        left: `${overlayStyle.left}px`,
        width: `${Math.max(overlayStyle.width, 300)}px`,
        zIndex: 200,
      }"
    >
      <p class="selection-popup__title">Новое бронирование</p>
      <p class="selection-popup__date">{{ selectedDate }}</p>
      <p class="selection-popup__time">{{ fromTimeStr }} – {{ toTimeStr }}</p>
      <p class="selection-popup__duration">{{ durationStr }}</p>

      <div class="selection-popup__divider" />

      <p class="selection-popup__tables">
        Столы
        <strong>
          {{ selectedTables.map(t => `#${t?.number}`).join(' + ') }}
        </strong>
      </p>
      <p class="selection-popup__capacity">
        На <strong>{{ totalCapacity }} чел</strong>
      </p>

      <div class="selection-popup__actions">
        <button class="selection-popup__btn selection-popup__btn--create" @click="handleCreate">
          Создать
        </button>
        <button class="selection-popup__btn selection-popup__btn--cancel" @click="handleCancel">
          Отменить
        </button>
      </div>
    </div>

  </template>
</template>

<style scoped>
.selection-overlay {
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 4px;
  pointer-events: none;
}

.selection-overlay--confirming {
  background: rgba(59, 130, 246, 0.1);
}

.selection-popup {
  background: var(--color-bg-secondary, #fff);
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.selection-popup__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.selection-popup__date {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.selection-popup__time {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.selection-popup__duration {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.selection-popup__divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: 12px;
}

.selection-popup__tables {
  font-size: 14px;
  margin-bottom: 4px;
}

.selection-popup__capacity {
  font-size: 14px;
  margin-bottom: 16px;
}

.selection-popup__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-popup__btn {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.selection-popup__btn:hover { opacity: 0.85; }

.selection-popup__btn--create {
  background: #3b82f6;
  color: #fff;
}

.selection-popup__btn--cancel {
  background: var(--color-bg-hover);
  color: var(--color-text);
}
</style>