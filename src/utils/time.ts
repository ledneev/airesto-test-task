export function getRestaurantTime(timezone: string): Date {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return new Date(formatted);
}

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function isoToMinutes(isoString: string, timezone: string): number {
  const date = new Date(isoString);
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const [hours, minutes] = formatted.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calcPosition(
  startMinutes: number,
  endMinutes: number,
  openingMinutes: number,
  closingMinutes: number,
): { top: number; height: number } {
  const totalMinutes = closingMinutes - openingMinutes;
  const top = ((startMinutes - openingMinutes) / totalMinutes) * 100;
  const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

  return {
    top: Math.max(0, top),
    height: Math.max(0, height),
  };
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  stepMinutes = 30,
): string[] {
  const start = timeStringToMinutes(openingTime)
  const end = timeStringToMinutes(closingTime)
  const slots: string[] = []

  const maxSlots = (24 * 60) / stepMinutes

  for (let m = start; m <= end && slots.length <= maxSlots; m += stepMinutes) {
    slots.push(minutesToTimeString(m))
  }

  return slots
}
