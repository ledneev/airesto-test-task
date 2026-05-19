<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '../../stores/bookingStore'
import type { PositionedEvent } from '../../types'
import IconSvg from '../IconSvg.vue'

const props = defineProps<{
  event: PositionedEvent
}>()

const store = useBookingStore()
const isHighlighted = computed(() => store.searchedEventId === props.event.id)

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

type BadgeVariant = 'neutral' | 'success' | 'accent' | 'info'

const badgeVariantMap: Record<string, BadgeVariant> = {
  New:     'neutral',
  Bill:    'success',
  Closed:  'neutral',
  'Живая очередь': 'neutral',
  'Новая':         'accent',
  'Заявка':        'info',
  'Открыт':        'success',
  'Закрыт':        'neutral',
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
const badgeVariant: BadgeVariant = badgeVariantMap[props.event.status] ?? 'neutral'
const isBanquet = props.event.status === 'Banquet'
const isOrder = props.event.type === 'order' && !isBanquet

const hiddenElements = computed(() => {
  const eventWithHidden = props.event as any
  return eventWithHidden.hiddenElements || {
    hideType: false,
    hideStatusBadge: false,
    hideTime: false,
    hideName: false,
    hideTable: false,
    hidePhone: false
  }
})
</script>

<template>
  <div
    :class="['event-card', { 'event-card--highlighted': isHighlighted }]"
    :data-event-id="event.id"
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
        <span
          class="event-card__status-badge"
          :class="[
            `event-card__status-badge--${badgeVariant}`,
            { 'event-card__status-badge--hidden': hiddenElements.hideStatusBadge }
          ]"
        >{{ statusLabel }}</span>
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
        <span class="event-card__time">
          {{ formatTime(event.start_time) }}-{{ formatTime(event.end_time) }}
        </span>
        <span
          class="event-card__status-badge"
          :class="[
            `event-card__status-badge--${badgeVariant}`,
            { 'event-card__status-badge--hidden': hiddenElements.hideStatusBadge }
          ]"
        >{{ statusLabel }}</span>
        <span
          class="event-card__phone"
          :class="{ 'event-card__phone--hidden': hiddenElements.hidePhone }"
        >
          <IconSvg name="phone" :size="12" />
          {{ event.phone_number?.slice(-4) }}
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
  min-height: 20px;
  transition: filter 0.15s, width 0.2s, backdrop-filter 0.2s;
}

.event-card:hover {
  filter: brightness(1.4);
  z-index: 100 !important;
  overflow: visible;
  backdrop-filter: blur(4px);
  width: fit-content;
  max-width: calc(100% + 40px);
  min-width: min-content;
}

.event-card--highlighted {
  box-shadow: 0 0 0 3px var(--color-accent), 0 0 10px rgba(59, 130, 246, 0.5);
  filter: brightness(1.3);
  z-index: 101 !important;
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
  white-space: normal;
}

.event-card__type--hidden,
.event-card__status-badge--hidden,
.event-card__time--hidden,
.event-card__name--hidden,
.event-card__table--hidden,
.event-card__phone--hidden {
  opacity: 0;
  pointer-events: none;
}

.event-card:hover .event-card__type--hidden,
.event-card:hover .event-card__status-badge--hidden,
.event-card:hover .event-card__time--hidden,
.event-card:hover .event-card__name--hidden,
.event-card:hover .event-card__table--hidden,
.event-card:hover .event-card__phone--hidden {
  opacity: 1;
  pointer-events: auto;
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
.event-card:hover .event-card__type,
.event-card:hover .event-card__time,
.event-card:hover .event-card__status-badge,
.event-card:hover .event-card__phone,
.event-card:hover .event-card__table {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.event-card__status-badge {
  font-size: 8px;
  font-weight: 600;
  line-height: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  width: fit-content;
  background: var(--badge-neutral-bg);
  color: var(--badge-neutral-text);
}

.event-card__status-badge--neutral {
  background: var(--badge-neutral-bg);
  color: var(--badge-neutral-text);
}

.event-card__status-badge--success {
  background: var(--badge-success-bg);
  color: var(--badge-success-text);
}

.event-card__status-badge--accent {
  background: var(--badge-accent-bg);
  color: var(--badge-accent-text);
}

.event-card__status-badge--info {
  background: var(--badge-info-bg);
  color: var(--badge-info-text);
}

.event-card__table {
  font-size: 10px;
}

.event-card__phone {
  display: flex;
  align-items: center;
  gap: 2px;
}

.event-card__phone .icon-svg {
  width: 10px;
  height: 10px;
}

.event-card__time {
  margin-bottom: 2px;
}
</style>