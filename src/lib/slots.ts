// Time slot calculation and availability logic
import { addMinutes, isWithinInterval, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import type { BusinessHours, TimeOff, Booking, TimeSlot, Service } from '@/types';

const BUSINESS_TIMEZONE = 'Europe/Zagreb';
const SLOT_INTERVAL = 15; // minutes between slots

export class SlotCalculator {
  constructor(
    private businessHours: BusinessHours[],
    private timeOff: TimeOff[],
    private existingBookings: Booking[],
    private staffId?: string // Optional: filter time-off for specific staff
  ) {}

  /**
   * Calculate available time slots for a specific date and service
   */
  calculateAvailableSlots(date: Date, service: Service): TimeSlot[] {
    const dayOfWeek = date.getDay();
    const businessHour = this.businessHours.find(bh => bh.dayOfWeek === dayOfWeek);

    if (!businessHour || !businessHour.active) {
      return []; // Business is closed this day
    }

    // Check if date is in time-off period
    if (this.isDateInTimeOff(date)) {
      return []; // Business is closed this day
    }

    // Generate all possible slots for the business hours
    const allSlots = this.generateSlotsForBusinessHour(businessHour, date);

    // Filter out unavailable slots
    const availableSlots = allSlots.map(slot => {
      const slotStart = this.createSlotDateTime(date, slot.time);
      const slotEnd = addMinutes(slotStart, service.duration);

      // Check if slot conflicts with existing bookings
      const isBooked = this.isSlotBooked(slotStart, slotEnd);
      
      // Check if slot is in the past
      const now = new Date();
      const isInPast = slotStart <= now;

      // Check if slot fits within business hours (considering service duration)
      const fitsInBusinessHours = this.slotFitsInBusinessHours(
        businessHour, 
        slot.time, 
        service.duration
      );

      let available = !isBooked && !isInPast && fitsInBusinessHours;
      let reason: string | undefined;

      if (isBooked) {
        reason = 'Zauzeto';
      } else if (isInPast) {
        reason = 'Prošlo vrijeme';
      } else if (!fitsInBusinessHours) {
        reason = 'Izvan radnog vremena';
      }

      return {
        time: slot.time,
        available,
        reason,
      };
    });

    return availableSlots;
  }

  /**
   * Generate all possible time slots for a business hour
   */
  private generateSlotsForBusinessHour(businessHour: BusinessHours, date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = businessHour.startTime.split(':').map(Number);
    const [endHour, endMinute] = businessHour.endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    // Round to next slot interval
    if (currentMinute % SLOT_INTERVAL !== 0) {
      currentMinute = Math.ceil(currentMinute / SLOT_INTERVAL) * SLOT_INTERVAL;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this slot is not during a break
      if (!this.isTimeInBreak(timeString, businessHour.breaks || [])) {
        slots.push({
          time: timeString,
          available: true, // Will be determined later
        });
      }

      // Move to next slot
      currentMinute += SLOT_INTERVAL;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  }

  /**
   * Check if a time is during a break period
   */
  private isTimeInBreak(time: string, breaks: { start: string; end: string }[]): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;

    return breaks.some(breakPeriod => {
      const [startHour, startMinute] = breakPeriod.start.split(':').map(Number);
      const [endHour, endMinute] = breakPeriod.end.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    });
  }

  /**
   * Check if a slot fits within business hours considering service duration
   */
  private slotFitsInBusinessHours(
    businessHour: BusinessHours, 
    slotTime: string, 
    serviceDuration: number
  ): boolean {
    const [slotHour, slotMinute] = slotTime.split(':').map(Number);
    const [endHour, endMinute] = businessHour.endTime.split(':').map(Number);

    const slotStartInMinutes = slotHour * 60 + slotMinute;
    const slotEndInMinutes = slotStartInMinutes + serviceDuration;
    const businessEndInMinutes = endHour * 60 + endMinute;

    return slotEndInMinutes <= businessEndInMinutes;
  }

  /**
   * Create a Date object for a specific slot time on a given date
   */
  private createSlotDateTime(date: Date, time: string): Date {
    const [hour, minute] = time.split(':').map(Number);
    const localDate = new Date(date);
    localDate.setHours(hour, minute, 0, 0);
    
    // Convert to UTC
    return zonedTimeToUtc(localDate, BUSINESS_TIMEZONE);
  }

  /**
   * Check if a slot time range conflicts with existing bookings
   */
  private isSlotBooked(slotStart: Date, slotEnd: Date): boolean {
    const isBooked = this.existingBookings.some(booking => {
      const bookingStart = booking.startAt;
      const bookingEnd = booking.endAt;

      // Check if slot overlaps with booking
      return (
        (slotStart < bookingEnd && slotEnd > bookingStart) &&
        booking.status !== 'CANCELED'
      );
    });
    
    return isBooked;
  }

  /**
   * Check if a date is within a time-off period
   */
  private isDateInTimeOff(date: Date): boolean {
    return this.timeOff.some(timeOff => {
      if (!timeOff.active) return false;

      // If staffId is provided, check if this time-off applies to this staff
      // Global time-off (staffId is undefined/null) applies to all staff
      // Individual time-off (staffId is set) applies only to that staff
      if (this.staffId && timeOff.staffId && timeOff.staffId !== this.staffId) {
        return false; // This time-off is for a different staff member
      }

      return isWithinInterval(date, {
        start: timeOff.startDate,
        end: timeOff.endDate
      });
    });
  }
}

/**
 * Helper function to get available slots for a specific date and service
 */
export async function getAvailableSlots(
  date: string, 
  serviceId: string,
  businessHours: BusinessHours[],
  timeOff: TimeOff[],
  existingBookings: Booking[],
  staffId?: string
): Promise<TimeSlot[]> {
  const slotDate = parseISO(date);
  const service = { duration: 30 } as Service; // This should be fetched from the service

  const calculator = new SlotCalculator(businessHours, timeOff, existingBookings, staffId);
  return calculator.calculateAvailableSlots(slotDate, service);
}

/**
 * Helper function to get default business hours (fallback)
 */
export function getDefaultBusinessHours(): BusinessHours[] {
  return [
    {
      id: '1',
      dayOfWeek: 1, // Monday
      startTime: '08:00',
      endTime: '20:00',
      active: true,
      breaks: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      dayOfWeek: 2, // Tuesday
      startTime: '08:00',
      endTime: '20:00',
      active: true,
      breaks: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      dayOfWeek: 3, // Wednesday
      startTime: '08:00',
      endTime: '20:00',
      active: true,
      breaks: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      dayOfWeek: 4, // Thursday
      startTime: '08:00',
      endTime: '20:00',
      active: true,
      breaks: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      dayOfWeek: 5, // Friday
      startTime: '08:00',
      endTime: '20:00',
      active: true,
      breaks: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      dayOfWeek: 6, // Saturday
      startTime: '08:00',
      endTime: '14:00',
      active: true,
      breaks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
