// Zod validation schemas for booking system
import { z } from 'zod';
import { isValid, parse, isFuture, isAfter } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

// Timezone from ENV
const BUSINESS_TIMEZONE = 'Europe/Zagreb';

// === BASIC TYPES ===

export const emailSchema = z.string()
  .email('Unesite valjan email')
  .min(5, 'Email mora imati najmanje 5 znakova')
  .max(255, 'Email ne smije biti duži od 255 znakova');

export const phoneSchema = z.string()
  .regex(/^[\+]?[0-9\s\-\(\)]{8,20}$/, 'Unesite valjan broj telefona')
  .optional()
  .or(z.literal(''));

export const nameSchema = z.string()
  .min(2, 'Ime mora imati najmanje 2 znaka')
  .max(100, 'Ime ne smije biti duže od 100 znakova')
  .regex(/^[a-zA-ZšđčćžŠĐČĆŽ\s\-\.]+$/, 'Ime smije sadržavati samo slova, razmake, crtice i točke');

export const notesSchema = z.string()
  .max(500, 'Napomena ne smije biti duža od 500 znakova')
  .optional()
  .or(z.literal(''));

// === BOOKING FORM ===

export const bookingFormSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String).refine(val => val.length > 0, 'Molimo odaberite uslugu'),
  
  clientName: nameSchema,
  
  clientEmail: emailSchema,
  
  clientPhone: phoneSchema,
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nevaljan format datuma (YYYY-MM-DD)')
    .refine((dateStr) => {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      return isValid(date) && isFuture(date);
    }, 'Datum mora biti u budućnosti'),
  
  timeSlot: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Nevaljan format vremena (HH:mm)')
    .refine((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, 'Nevaljan vremenski slot'),
  
  notes: notesSchema,
  
  gdprConsent: z.boolean()
    .refine(val => val === true, 'Morate prihvatiti uvjete korištenja'),
})
.refine((data) => {
  // Check if date and time combination is in the future
  try {
    const dateTimeStr = `${data.date}T${data.timeSlot}:00`;
    const localDateTime = parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm:ss", new Date());
    const utcDateTime = zonedTimeToUtc(localDateTime, BUSINESS_TIMEZONE);
    return isAfter(utcDateTime, new Date());
  } catch {
    return false;
  }
}, {
  message: 'Odabrani termin mora biti u budućnosti',
  path: ['timeSlot'],
});

// === API REQUEST SCHEMAS ===

export const availabilityRequestSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String),
  staffId: z.union([z.string(), z.number()]).transform(String).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nevaljan format datuma'),
});

export const bookingCreateRequestSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String),
  staffId: z.union([z.string(), z.number()]).transform(String).optional(),
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  startAt: z.string()
    .datetime('Nevaljan ISO datetime format')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return isFuture(date);
    }, 'Datum i vrijeme moraju biti u budućnosti'),
  notes: notesSchema,
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED', 'NO_SHOW']).optional(),
  notes: notesSchema,
  adminId: z.string().optional(),
}).partial();

export const bookingCancelSchema = z.object({
  token: z.string().min(1, 'Nevaljan cancel token'),
  reason: z.string().max(200, 'Razlog ne smije biti duži od 200 znakova').optional(),
});

// === HELPER FUNCTIONS ===

export function validateTimeSlot(timeSlot: string, serviceDuration: number): boolean {
  // Check if time slot is valid
  const [hours, minutes] = timeSlot.split(':').map(Number);
  
  // Check if hours and minutes are valid
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return false;
  }
  
  // Check if slot is on 15-minute intervals
  if (minutes % 15 !== 0) {
    return false;
  }
  
  return true;
}

export function validateBookingTime(
  dateStr: string, 
  timeStr: string, 
  duration: number
): { valid: boolean; error?: string } {
  try {
    // Create local datetime
    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    const localDateTime = parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm:ss", new Date());
    
    if (!isValid(localDateTime)) {
      return { valid: false, error: 'Nevaljan datum ili vrijeme' };
    }
    
    // Convert to UTC
    const utcDateTime = zonedTimeToUtc(localDateTime, BUSINESS_TIMEZONE);
    
    // Check if it's in the future
    if (!isFuture(utcDateTime)) {
      return { valid: false, error: 'Termin mora biti u budućnosti' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Greška pri validaciji datuma i vremena' };
  }
}

// === SANITIZATION ===

export function sanitizeInput(input: string): string {
  // Basic sanitization
  return input
    .trim()
    .replace(/[<>'"]/g, '') // remove basic HTML characters
    .slice(0, 1000); // limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// === TYPES ===

export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type AvailabilityRequest = z.infer<typeof availabilityRequestSchema>;
export type BookingCreateRequest = z.infer<typeof bookingCreateRequestSchema>;
export type BookingUpdateRequest = z.infer<typeof bookingUpdateSchema>;
export type BookingCancelRequest = z.infer<typeof bookingCancelSchema>;
