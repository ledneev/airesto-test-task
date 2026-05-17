<script setup lang="ts">
import type { PositionedEvent } from "../../types";

const props = defineProps<{
  event: PositionedEvent;
}>();

const colorMap: Record<string, string> = {

  New: "var(--color-order-new)",
  Bill: "var(--color-order-bill)",
  Closed: "var(--color-order-closed)",
  Banquet: "var(--color-order-banquet)",

  "Живая очередь": "var(--color-reservation-queue)",
  Новая: "var(--color-reservation-new)",
  Заявка: "var(--color-reservation-application)",
  Открыт: "var(--color-reservation-open)",
  Закрыт: "var(--color-reservation-closed)",
};

const labelMap: Record<string, string> = {
  New: "Новый",
  Bill: "Чек",
  Closed: "Закрытый",
  Banquet: "Банкет",
  "Живая очередь": "Живая очередь",
  Новая: "Ожидает подтверждения",
  Заявка: "Ожидаем",
  Открыт: "В зале",
  Закрыт: "Отменен",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Vladivostok",
  });
}

const bgColor = colorMap[props.event.status] ?? "#1a1d27";
const statusLabel = labelMap[props.event.status] ?? props.event.status;
const isReservation = props.event.type === "reservation";
const isBanquet = props.event.status === "Banquet";
</script>

<template>
  <div
    class="event-card"
    :style="{
      top: `${event.top}%`,
      height: `${event.height}%`,
      left: event.width < 100 ? `${event.left}%` : `${event.left}px`,
      width: event.width < 100 ? `${event.width}%` : `calc(100% - ${event.left}px)`,
      zIndex: event.zIndex,
      background: bgColor,
    }"
  >
    <div class="event-card__content">
      <template v-if="isReservation">
        <span class="event-card__table">№111</span>
        <span class="event-card__name">{{ event.name }}; {{ event.num_people }}чел</span>
        <span class="event-card__status" :class="`event-card__status--${event.status}`">
          {{ statusLabel }}
        </span>
        <span class="event-card__phone"><img src="../../assets/img/phone.svg" alt="phone image" aria-hidden=true>{{ event.phone_number?.slice(-4) }}</span>
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
        <span class="event-card__type">Заказ</span>
        <span class="event-card__status-text">{{ statusLabel }}</span>
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
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: filter 0.2s, z-index 0s;
  min-height: 20px;
}

.event-card:hover {
  filter: brightness(1.3);
  z-index: 100 !important;
  overflow: visible;
}

.event-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  font-size: 11px;
  line-height: 1.3;
  height: 100%;
  overflow: hidden;
}

.event-card:hover .event-card__content {
  overflow: visible;
  background: inherit;
  border-radius: 4px;
  z-index: 100;
}

.event-card__table {
  font-size: 10px;
  color: var(--color-text-muted);
}

.event-card__name {
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-card:hover .event-card__name {
  white-space: normal;
  overflow: visible;
}

.event-card__status {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
}

.event-card__status--Новая { background: #1d4ed8; color: #fff; }
.event-card__status--Заявка { color: #f59e0b; }
.event-card__status--Открыт { color: #10b981; }
.event-card__status--Закрыт { color: #6b7280; }
.event-card__status--Живая\ очередь { color: #8b5cf6; }

.event-card__phone {
  font-size: 10px;
  color: var(--color-text-muted);
}

.event-card__time {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: auto;
}

.event-card__type {
  font-weight: 600;
  font-size: 11px;
}

.event-card__status-text {
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>