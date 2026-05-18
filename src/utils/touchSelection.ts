import { timeStringToMinutes } from './time';

export function getTouchCoordinates(event: TouchEvent): { clientX: number; clientY: number } {
  if (event.touches.length === 0) {
    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    }
    return { clientX: 0, clientY: 0 };
  }
  const touch = event.touches[0];
  return { clientX: touch.clientX, clientY: touch.clientY };
}

export function getMinutesFromTouchY(
  event: TouchEvent,
  colInner: HTMLElement,
  openingTime: string,
  closingTime: string,
): number {
  const { clientY } = getTouchCoordinates(event);
  const rect = colInner.getBoundingClientRect();
  const percent = Math.max(
    0,
    Math.min(1, (clientY - rect.top) / rect.height),
  );
  
  const openingMin = timeStringToMinutes(openingTime);
  const closingMin = timeStringToMinutes(closingTime);
  const totalMin = closingMin - openingMin;
  const rawMinutes = openingMin + percent * totalMin;
  const SNAP_MIN = 5;
  return Math.round(rawMinutes / SNAP_MIN) * SNAP_MIN;
}

export function createTouchHandlers(
  mouseDownHandler: (event: MouseEvent, tableId: string, colInner: HTMLElement) => void,
  mouseMoveHandler: (event: MouseEvent, tableId: string, colInner: HTMLElement) => void,
  mouseUpHandler: () => void,
) {
  let currentTableId: string | null = null;
  let currentColInner: HTMLElement | null = null;
  let isTouchSelecting = false;
  
  function handleTouchStart(event: TouchEvent, tableId: string, colInner: HTMLElement) {
    const target = event.target as HTMLElement;
    if (target.closest('.event-card')) {
      return;
    }
    
    event.preventDefault();
    currentTableId = tableId;
    currentColInner = colInner;
    isTouchSelecting = true;
    const { clientX, clientY } = getTouchCoordinates(event);
    const syntheticEvent = new MouseEvent('mousedown', {
      clientX,
      clientY,
      bubbles: true,
    }) as MouseEvent;

    Object.defineProperty(syntheticEvent, 'target', { value: target, writable: true });
    Object.defineProperty(syntheticEvent, 'currentTarget', { value: colInner, writable: true });
    
    mouseDownHandler(syntheticEvent, tableId, colInner);
  }
  
  function handleTouchMove(event: TouchEvent) {
    if (!isTouchSelecting || !currentTableId || !currentColInner) return;
    
    event.preventDefault();

    const { clientX, clientY } = getTouchCoordinates(event);
    const syntheticEvent = new MouseEvent('mousemove', {
      clientX,
      clientY,
      bubbles: true,
    }) as MouseEvent;
    
    mouseMoveHandler(syntheticEvent, currentTableId, currentColInner);
  }
  
  function handleTouchEnd(event: TouchEvent) {
    if (!isTouchSelecting) return;
    
    event.preventDefault();
    isTouchSelecting = false;
    currentTableId = null;
    currentColInner = null;
    mouseUpHandler();
  }
  
  function handleTouchCancel(event: TouchEvent) {
    event.preventDefault();
    isTouchSelecting = false;
    currentTableId = null;
    currentColInner = null;
    mouseUpHandler();
  }
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}

export function findColumnAtCoordinates(
  clientX: number,
  clientY: number,
): { tableId: string; colInner: HTMLElement } | null {
  const columnElements = document.querySelectorAll('.booking-table__col-inner');
  
  for (const element of columnElements) {
    const colInner = element as HTMLElement;
    const rect = colInner.getBoundingClientRect();

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      const parentTd = colInner.closest('td[data-table-id]');
      if (parentTd) {
        const tableId = parentTd.getAttribute('data-table-id');
        if (tableId) {
          return { tableId, colInner };
        }
      }
    }
  }
  
  return null;
}

export function createGlobalTouchHandlers(
  mouseDownHandler: (event: MouseEvent, tableId: string, colInner: HTMLElement) => void,
  mouseMoveHandler: (event: MouseEvent, tableId: string, colInner: HTMLElement) => void,
  mouseUpHandler: () => void,
) {
  let isTouchSelecting = false;
  let initialTableId: string | null = null;
  let initialColInner: HTMLElement | null = null;
  
  function handleTouchStart(event: TouchEvent, tableId: string, colInner: HTMLElement) {
    const target = event.target as HTMLElement;
    if (target.closest('.event-card')) {
      return;
    }
    
    event.preventDefault();
    isTouchSelecting = true;
    initialTableId = tableId;
    initialColInner = colInner;

    const { clientX, clientY } = getTouchCoordinates(event);
    const syntheticEvent = new MouseEvent('mousedown', {
      clientX,
      clientY,
      bubbles: true,
    }) as MouseEvent;

    Object.defineProperty(syntheticEvent, 'target', { value: target, writable: true });
    Object.defineProperty(syntheticEvent, 'currentTarget', { value: colInner, writable: true });
    
    mouseDownHandler(syntheticEvent, tableId, colInner);
  }
  
  function handleGlobalTouchMove(event: TouchEvent) {
    if (!isTouchSelecting) return;
    
    event.preventDefault();
    
    const { clientX, clientY } = getTouchCoordinates(event);

    const columnInfo = findColumnAtCoordinates(clientX, clientY);

    const tableId = columnInfo?.tableId || initialTableId;
    const colInner = columnInfo?.colInner || initialColInner;
    
    if (!tableId || !colInner) return;
    
    const syntheticEvent = new MouseEvent('mousemove', {
      clientX,
      clientY,
      bubbles: true,
    }) as MouseEvent;
    
    mouseMoveHandler(syntheticEvent, tableId, colInner);
  }
  
  function handleTouchEnd(event: TouchEvent) {
    if (!isTouchSelecting) return;
    
    event.preventDefault();
    isTouchSelecting = false;
    initialTableId = null;
    initialColInner = null;
    mouseUpHandler();
  }
  
  function handleTouchCancel(event: TouchEvent) {
    event.preventDefault();
    isTouchSelecting = false;
    initialTableId = null;
    initialColInner = null;
    mouseUpHandler();
  }
  
  return {
    handleTouchStart,
    handleGlobalTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0;
}