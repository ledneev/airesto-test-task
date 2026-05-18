import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { mockData } from "../data/mockData";
import type { BookingResponse, Zone } from "../types";

export const useBookingStore = defineStore("booking", () => {
  const data = ref<BookingResponse>(mockData);
  const selectedDate = ref<string>(mockData.current_day);
  const activeZones = ref<Zone[]>(["1 этаж", "2 этаж", "Банкетный зал"]);
  const searchedEventId = ref<string | number | null>(null);
  const scrollToEventId = ref<string | number | null>(null);

  const restaurant = computed(() => data.value.restaurant);
  const availableDays = computed(() => data.value.available_days);

  const allZones = computed<Zone[]>(() => [
    "1 этаж",
    "2 этаж",
    "Банкетный зал",
  ]);

  const filteredTables = computed(() =>
    data.value.tables.filter((t) => activeZones.value.includes(t.zone)),
  );

  function selectDate(date: string) {
    selectedDate.value = date;
  }

  function toggleZone(zone: Zone) {
    const index = activeZones.value.indexOf(zone);
    if (index === -1) {
      activeZones.value.push(zone);
    } else {
      activeZones.value.splice(index, 1);
    }
  }

  function isZoneActive(zone: Zone): boolean {
    return activeZones.value.includes(zone);
  }

  function setSearchedEventId(id: string | number | null) {
    searchedEventId.value = id;
  }

  function requestScrollToEvent(id: string | number) {
    scrollToEventId.value = id;
    setTimeout(() => {
      scrollToEventId.value = null;
    }, 100);
  }

  return {
    data,
    selectedDate,
    activeZones,
    searchedEventId,
    scrollToEventId,
    restaurant,
    availableDays,
    allZones,
    filteredTables,
    selectDate,
    toggleZone,
    isZoneActive,
    setSearchedEventId,
    requestScrollToEvent,
  };
});
