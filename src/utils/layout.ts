import type { CalendarEvent, PositionedEvent } from '../types'
import type { Table } from '../types'
import { isoToMinutes, calcPosition, timeStringToMinutes } from './time'

const OVERLAP_OFFSET_PX = 4
const INTERSECTION_WINDOW_MIN = 30

export function mergeEvents(table: Table, selectedDate: string): CalendarEvent[] {
  const orders: CalendarEvent[] = table.orders
    .filter(o => o.start_time.startsWith(selectedDate))
    .map(o => ({
      id: o.id,
      type: 'order' as const,
      status: o.status,
      start_time: o.start_time,
      end_time: o.end_time,
    }))

  const reservations: CalendarEvent[] = table.reservations
    .filter(r => r.seating_time.startsWith(selectedDate))
    .map(r => ({
      id: r.id,
      type: 'reservation' as const,
      status: r.status,
      start_time: r.seating_time,
      end_time: r.end_time,
      name: r.name_for_reservation,
      num_people: r.num_people,
      phone_number: r.phone_number,
    }))

  return [...orders, ...reservations]
}

function doEventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.start_time < b.end_time && b.start_time < a.end_time
}

function startDiffMinutes(
  a: CalendarEvent,
  b: CalendarEvent,
  timezone: string,
): number {
  return Math.abs(
    isoToMinutes(a.start_time, timezone) - isoToMinutes(b.start_time, timezone)
  )
}

interface EventGroup {
  columns: CalendarEvent[][]
  offsetPx: number
}

export function positionEvents(
  events: CalendarEvent[],
  openingTime: string,
  closingTime: string,
  timezone: string,
): PositionedEvent[] {
  if (!events.length) return []

  const openingMin = timeStringToMinutes(openingTime)
  const closingMin = timeStringToMinutes(closingTime)

  const sorted = [...events].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  )

  const result: PositionedEvent[] = []
  const visited = new Set<string | number>()
  const groups: CalendarEvent[][] = []

  for (const event of sorted) {
    if (visited.has(event.id)) continue

    const group: CalendarEvent[] = [event]
    visited.add(event.id)

    for (const other of sorted) {
      if (visited.has(other.id)) continue
      if (doEventsOverlap(event, other)) {
        group.push(other)
        visited.add(other.id)
      }
    }

    groups.push(group)
  }

  for (const group of groups) {
    group.sort((a, b) => a.start_time.localeCompare(b.start_time))

    const packs: CalendarEvent[][] = []

    for (const event of group) {
      let placed = false
      for (const pack of packs) {
        const packStart = pack[0]
        if (startDiffMinutes(event, packStart, timezone) < INTERSECTION_WINDOW_MIN) {
          pack.push(event)
          placed = true
          break
        }
      }
      if (!placed) packs.push([event])
    }

    packs.forEach((pack, packIndex) => {
      const colCount = pack.length
      const offsetPx = packIndex * OVERLAP_OFFSET_PX

      pack.forEach((event, colIndex) => {
        const startMin = isoToMinutes(event.start_time, timezone)
        const endMin = isoToMinutes(event.end_time, timezone)
        const { top, height } = calcPosition(startMin, endMin, openingMin, closingMin)

        result.push({
          ...event,
          top,
          height,
          left: colCount > 1 ? (colIndex / colCount) * 100 : offsetPx,
          width: colCount > 1 ? 100 / colCount : 100,
          zIndex: packIndex,
          offsetPx: colCount === 1 ? offsetPx : 0,
        })
      })
    })
  }

  return result
}