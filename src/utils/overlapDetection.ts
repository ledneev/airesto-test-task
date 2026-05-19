import type { PositionedEvent } from '../types'

function isoToMinutes(iso: string): number {
  const date = new Date(iso)
  return date.getHours() * 60 + date.getMinutes()
}

function computeStartTimeDiffMinutes(event1: PositionedEvent, event2: PositionedEvent): number {
  const start1 = isoToMinutes(event1.start_time)
  const start2 = isoToMinutes(event2.start_time)
  return start2 - start1
}

export function getHiddenElements(
  event: PositionedEvent,
  otherEventsInColumn: PositionedEvent[]
): {
  hideType: boolean
  hideStatusBadge: boolean
  hideTime: boolean
  hideName: boolean
  hideTable: boolean
  hidePhone: boolean
} {
  const result = {
    hideType: false,
    hideStatusBadge: false,
    hideTime: false,
    hideName: false,
    hideTable: false,
    hidePhone: false
  }

  if (event.type === 'order') {
    return result
  }
  
  if (otherEventsInColumn.length === 0) {
    return result
  }

  let shouldHide = false
  let shouldHideOnlyPhone = false
  
  for (const otherEvent of otherEventsInColumn) {
    if (otherEvent.id === event.id) continue
    
    const diff = computeStartTimeDiffMinutes(event, otherEvent)
    if (diff > 0) {
      if (diff >= 30 && diff <= 33 ) {
        shouldHide = true
        break
      } else if (diff > 34 && diff <= 50) {
        shouldHideOnlyPhone = true
      }
    }
  }

  if (shouldHide) {
    result.hideStatusBadge = true
    result.hidePhone = true
  } else if (shouldHideOnlyPhone) {
    result.hidePhone = true
  }
  
  return result
}

export function computeHiddenFlags(events: PositionedEvent[]): PositionedEvent[] {
  if (events.length <= 1) {
    return events.map(event => ({
      ...event,
      isHidden: false,
      hiddenElements: {
        hideType: false,
        hideStatusBadge: false,
        hideTime: false,
        hideName: false,
        hideTable: false,
        hidePhone: false
      }
    }))
  }
  
  return events.map(event => {
    const otherEvents = events.filter(e => e.id !== event.id)
    const hiddenElements = getHiddenElements(event, otherEvents)
    const isHidden = Object.values(hiddenElements).some(v => v === true)
    
    return {
      ...event,
      isHidden,
      hiddenElements
    }
  })
}