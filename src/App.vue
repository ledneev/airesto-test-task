<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import DatePicker from './components/DatePicker.vue'
import ZoneFilter from './components/ZoneFilter.vue'
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
</style>