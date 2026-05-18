<script setup lang="ts">
import type { PositionedEvent } from '../../types'

const props = defineProps<{
  event: PositionedEvent
}>()

interface EventStyle {
  bg: string
  border: string
}

const styleMap: Record<string, EventStyle> = {

  New:     { bg: 'var(--color-order-bg)',       border: 'var(--color-order-border)' },
  Bill:    { bg: 'var(--color-order-bg)',       border: 'var(--color-order-border)' },
  Closed:  { bg: 'var(--color-order-bg)',       border: 'var(--color-order-border)' },
  Banquet: { bg: 'var(--color-banquet-bg)',     border: 'var(--color-banquet-border)' },

  'Живая очередь': { bg: 'var(--color-queue-bg)',       border: 'var(--color-queue-border)' },
  'Новая':         { bg: 'var(--color-reservation-bg)', border: 'var(--color-reservation-border)' },
  'Заявка':        { bg: 'var(--color-reservation-bg)', border: 'var(--color-reservation-border)' },
  'Открыт':        { bg: 'var(--color-reservation-bg)', border: 'var(--color-reservation-border)' },
  'Закрыт':        { bg: 'var(--color-reservation-bg)', border: 'var(--color-reservation-border)' },
}

const labelMap: Record<string, string> = {
  New:     'Новый',
  Bill:    'Пречек',
  Closed:  'Закрытый',
  Banquet: 'Банкет',
  'Живая очередь': 'Живая очередь',
  'Новая':         'Ожидает подтверждения',
  'Заявка':        'Ожидаем',
  'Открыт':        'В зале',
  'Закрыт':        'Отменен',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Vladivostok',
  })
}

const eventStyle = styleMap[props.event.status] ?? styleMap['New']
const statusLabel = labelMap[props.event.status] ?? props.event.status
const isReservation = props.event.type === 'reservation'
const isBanquet = props.event.status === 'Banquet'
const isOrder = props.event.type === 'order' && !isBanquet
</script>

<template>
  <div
    class="event-card"
    :style="{
      top: `${event.top}%`,
      height: `${event.height}%`,
      left: event.width < 100 ? `${event.left}%` : `${event.offsetPx}px`,
      width: event.width < 100 ? `${event.width}%` : `calc(100% - ${event.offsetPx}px)`,
      zIndex: event.zIndex,
      background: eventStyle.bg,
      borderLeftColor: eventStyle.border,
    }"
  >
    <div class="event-card__content">

      <template v-if="isOrder">
        <span class="event-card__type">Заказ</span>
        <span class="event-card__status-label">{{ statusLabel }}</span>
        <span class="event-card__time">
          {{ formatTime(event.start_time) }}-{{ formatTime(event.end_time) }}
        </span>
      </template>

      <template v-else-if="isBanquet">
        <span class="event-card__type">Банкет</span>
        <span class="event-card__time">
          {{ formatTime(event.start_time) }}-{{ formatTime(event.end_time) }}
        </span>
      </template>

      <template v-else>
        <span class="event-card__table">№111</span>
        <span class="event-card__name">
          {{ event.name }}; {{ event.num_people }}чел
        </span>
        <span class="event-card__status-badge">{{ statusLabel }}</span>
        <span class="event-card__phone">
          <img src="../../assets/img/phone.svg" alt="" aria-hidden="true">
          {{ event.phone_number?.slice(-4) }}
        </span>
        <span class="event-card__time">
          {{ formatTime(event.start_time) }}-{{ formatTime(event.end_time) }}
        </span>
      </template>

    </div>
  </div>
</template>

<style scoped>
.event-card {
  position: absolute;
  border-radius: 4px;
  border-left: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  transition: filter 0.15s;
  min-height: 20px;
}

.event-card:hover {
  filter: brightness(1.4);
  z-index: 100 !important;
  overflow: visible;
}

.event-card__content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 6px;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.event-card:hover .event-card__content {
  overflow: visible;
}

.event-card__type,
.event-card__name,
.event-card__table,
.event-card__phone,
.event-card__time {
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-card:hover .event-card__name,
.event-card:hover .event-card__type {
  white-space: normal;
  overflow: visible;
}

.event-card__status-label,
.event-card__status-badge {
  font-size: 8px;
  font-weight: 600;
  line-height: 8px;
  color: var(--color-text-muted);
}

.event-card__status-badge {
  background: rgba(255,255,255,0.1);
  padding: 1px 4px;
  border-radius: 2px;
  width: fit-content;
}

.event-card__table {
  font-size: 10px;
  color: var(--color-text-muted);
}

.event-card__phone {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--color-text-muted);
}

.event-card__phone img {
  width: 10px;
  height: 10px;
}

.event-card__time {
  margin-top: auto;
  color: var(--color-text-muted);
}
</style>