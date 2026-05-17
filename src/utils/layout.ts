import type { CalendarEvent, PositionedEvent, Table } from "../types";
import { calcPosition, isoToMinutes, timeStringToMinutes } from "./time";

const OVERLAP_OFFSET_PX = 4;
const INTERSECTION_WINDOW_MINUTES = 30;

function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.start_time < b.end_time && b.start_time < a.end_time;
}

function eventsIntersect(
  a: CalendarEvent,
  b: CalendarEvent,
  timezone: string,
): boolean {
  const aStart = isoToMinutes(a.start_time, timezone);
  const bStart = isoToMinutes(b.start_time, timezone);
  return Math.abs(aStart - bStart) <= INTERSECTION_WINDOW_MINUTES;
}

export function positionEvents(
  events: CalendarEvent[],
  openingTime: string,
  closingTime: string,
  timezone: string,
): PositionedEvent[] {
  if (!events.length) return [];

  const sorted = [...events].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const openingMinutes = timeStringToMinutes(openingTime);
  const closingMinutes = timeStringToMinutes(closingTime);

  const columns: CalendarEvent[][] = [];

  for (const event of sorted) {
    let placed = false;

    for (const column of columns) {
      const lastInColumn = column[column.length - 1];

      if (
        eventsIntersect(event, lastInColumn, timezone) &&
        !eventsOverlap(event, lastInColumn)
      ) {
        column.push(event);
        placed = true;
        break;
      }

      if (!eventsOverlap(event, lastInColumn)) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  }

  const totalColumns = columns.length;

  const result: PositionedEvent[] = [];

  columns.forEach((column, colIndex) => {
    column.forEach((event, eventIndex) => {
      const startMinutes = isoToMinutes(event.start_time, timezone);
      const endMinutes = isoToMinutes(event.end_time, timezone);
      const { top, height } = calcPosition(
        startMinutes,
        endMinutes,
        openingMinutes,
        closingMinutes,
      );

      const overlapOffset = eventIndex * OVERLAP_OFFSET_PX;

      result.push({
        ...event,
        top,
        height,
        left:
          totalColumns > 1 ? (colIndex / totalColumns) * 100 : overlapOffset,
        width: totalColumns > 1 ? 100 / totalColumns : 100,
        zIndex: eventIndex,
      });
    });
  });

  return result;
}

export function mergeEvents(
  table: Table,
  selectedDate: string,
): CalendarEvent[] {
  const orders: CalendarEvent[] = table.orders
    .filter((o) => o.start_time.startsWith(selectedDate))
    .map((o) => ({
      id: o.id,
      type: "order" as const,
      status: o.status,
      start_time: o.start_time,
      end_time: o.end_time,
    }));

  const reservations: CalendarEvent[] = table.reservations
    .filter((r) => r.seating_time.startsWith(selectedDate))
    .map((r) => ({
      id: r.id,
      type: "reservation" as const,
      status: r.status,
      start_time: r.seating_time,
      end_time: r.end_time,
      name: r.name_for_reservation,
      num_people: r.num_people,
      phone_number: r.phone_number,
    }));

  return [...orders, ...reservations];
}
