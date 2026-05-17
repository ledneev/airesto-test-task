<script setup lang="ts">
import { useBookingStore } from "../stores/bookingStore";

const store = useBookingStore();
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
      <button class="header__btn">
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
</style>