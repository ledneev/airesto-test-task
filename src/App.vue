<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import DatePicker from './components/DatePicker.vue'
import ZoneFilter from './components/ZoneFilter.vue'
import BookingTable from './components/BookingTable/BookingTable.vue'
</script>

<template>
  <div class="app">
    <TheHeader />
    <main class="main">
      <h1 class="main__title">Бронирования</h1>
      <div class="main__controls">
        <DatePicker />
        <ZoneFilter />
      </div>
      <BookingTable />
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}

.main__title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.main__controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .app .main {
    padding: 12px;
    overflow: auto; /* Восстанавливаем вертикальный скролл */
  }

  .app .main__title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .app .main__controls {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    align-items: center;
    overflow: visible;
  }
}

@media (max-width: 480px) {
  .app .main__title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .app .main__controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

@media (max-width: 360px) {
  .app .main {
    padding: 8px;
    overflow: auto;
  }

  .app .main__controls {
    gap: 8px;
    margin-bottom: 8px;
  }
}
</style>