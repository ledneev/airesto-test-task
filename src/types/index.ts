export type OrderStatus = 'New' | 'Bill' | 'Closed' | 'Banquet'

export type ReservationStatus =
  | 'Живая очередь'
  | 'Новая'
  | 'Заявка'
  | 'Открыт'
  | 'Закрыт'

export type Zone = '1 этаж' | '2 этаж' | 'Банкетный зал'

export interface Order {
  id: string
  status: OrderStatus
  start_time: string
  end_time: string
}

export interface Reservation {
  id: number
  name_for_reservation: string
  num_people: number
  phone_number: string
  status: ReservationStatus
  seating_time: string
  end_time: string
}

export interface Table {
  id: string
  capacity: number
  number: string
  zone: Zone
  orders: Order[]
  reservations: Reservation[]
}

export interface Restaurant {
  id: number
  timezone: string
  restaurant_name: string
  opening_time: string
  closing_time: string
}

export interface BookingResponse {
  available_days: string[]
  current_day: string
  restaurant: Restaurant
  tables: Table[]
}

export interface CalendarEvent {
  id: string | number
  type: 'order' | 'reservation'
  status: OrderStatus | ReservationStatus
  start_time: string
  end_time: string
  name?: string
  num_people?: number
  phone_number?: string
}

export interface PositionedEvent extends CalendarEvent {
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}