// Core types for the booking system

export type DatabaseProvider = 'supabase';

export type UserRole = 'ADMIN' | 'CLIENT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'NO_SHOW';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  
  // Client data
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  
  // Booking details
  serviceId: string;
  service?: Service;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
  notes?: string;
  
  // External identifiers
  googleEventId?: string;
  outlookEventId?: string;
  cancelToken: string;
  
  // Administration
  adminId?: string;
  admin?: User;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  active: boolean;
  breaks?: TimeBreak[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBreak {
  start: string; // "HH:mm" format
  end: string;   // "HH:mm" format
}

export interface TimeOff {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  recurring: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  data?: {
    date: string;
    slots: TimeSlot[];
    service: Service;
  };
  error?: string;
}

export interface BookingResponse {
  success: boolean;
  data?: {
    booking: Booking;
    calendarUrls?: {
      google: string;
      outlook: string;
      ics: string;
    };
  };
  error?: string;
  message?: string;
}

export interface ServicesResponse {
  success: boolean;
  data?: Service[];
  error?: string;
}
