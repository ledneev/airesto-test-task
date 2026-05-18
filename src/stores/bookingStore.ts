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

  interface SelectionState {
    isSelecting: boolean;
    isConfirming: boolean;
    startTableId: string | null;
    endTableId: string | null;
    startMinutes: number | null;
    endMinutes: number | null;
  }

  const selection = ref<SelectionState>({
    isSelecting: false,
    isConfirming: false,
    startTableId: null,
    endTableId: null,
    startMinutes: null,
    endMinutes: null,
  });

  function startSelection(tableId: string, minutes: number) {
    selection.value = {
      isSelecting: true,
      isConfirming: false,
      startTableId: tableId,
      endTableId: tableId,
      startMinutes: minutes,
      endMinutes: minutes,
    };
  }

  function updateSelection(tableId: string, minutes: number) {
    if (!selection.value.isSelecting) return;
    selection.value.endTableId = tableId;
    selection.value.endMinutes = minutes;
  }

  function confirmSelection() {
    selection.value.isSelecting = false;
    selection.value.isConfirming = true;
  }

  function cancelSelection() {
    selection.value = {
      isSelecting: false,
      isConfirming: false,
      startTableId: null,
      endTableId: null,
      startMinutes: null,
      endMinutes: null,
    };
  }

  const selectionRange = computed(() => {
    const s = selection.value;
    if (
      !s.startTableId ||
      !s.endTableId ||
      s.startMinutes === null ||
      s.endMinutes === null
    ) {
      return null;
    }

    const tableIds = filteredTables.value.map((t) => t.id);
    const startIdx = tableIds.indexOf(s.startTableId);
    const endIdx = tableIds.indexOf(s.endTableId);

    return {
      fromTableIdx: Math.min(startIdx, endIdx),
      toTableIdx: Math.max(startIdx, endIdx),
      fromMinutes: Math.min(s.startMinutes, s.endMinutes),
      toMinutes: Math.max(s.startMinutes, s.endMinutes),
      tableIds: tableIds.slice(
        Math.min(startIdx, endIdx),
        Math.max(startIdx, endIdx) + 1,
      ),
    };
  });

  interface LocalEvent {
    tableIds: string[];
    fromMinutes: number;
    toMinutes: number;
    date: string;
  }

  const localEvents = ref<LocalEvent[]>([]);

  function addLocalEvent(event: LocalEvent) {
    localEvents.value.push(event);
    // будь у нас АПИ тут был бы АПИ вызов
    console.log("Сохранено в store:", event);
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
    selection,
    selectionRange,
    startSelection,
    updateSelection,
    confirmSelection,
    cancelSelection,
    localEvents,
    addLocalEvent,
  };
});
