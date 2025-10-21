import { z } from 'zod';
import { parse, isValid, isFuture, isAfter } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

const BUSINESS_TIMEZONE = "Europe/Zagreb";
const emailSchema = z.string().email("Unesite valjan email").min(5, "Email mora imati najmanje 5 znakova").max(255, "Email ne smije biti duži od 255 znakova");
const phoneSchema = z.string().regex(/^[\+]?[0-9\s\-\(\)]{8,20}$/, "Unesite valjan broj telefona").optional().or(z.literal(""));
const nameSchema = z.string().min(2, "Ime mora imati najmanje 2 znaka").max(100, "Ime ne smije biti duže od 100 znakova").regex(/^[a-zA-ZšđčćžŠĐČĆŽ\s\-\.]+$/, "Ime smije sadržavati samo slova, razmake, crtice i točke");
const notesSchema = z.string().max(500, "Napomena ne smije biti duža od 500 znakova").optional().or(z.literal(""));
z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String).refine((val) => val.length > 0, "Molimo odaberite uslugu"),
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nevaljan format datuma (YYYY-MM-DD)").refine((dateStr) => {
    const date = parse(dateStr, "yyyy-MM-dd", /* @__PURE__ */ new Date());
    return isValid(date) && isFuture(date);
  }, "Datum mora biti u budućnosti"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Nevaljan format vremena (HH:mm)").refine((timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }, "Nevaljan vremenski slot"),
  notes: notesSchema,
  gdprConsent: z.boolean().refine((val) => val === true, "Morate prihvatiti uvjete korištenja")
}).refine((data) => {
  try {
    const dateTimeStr = `${data.date}T${data.timeSlot}:00`;
    const localDateTime = parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm:ss", /* @__PURE__ */ new Date());
    const utcDateTime = zonedTimeToUtc(localDateTime, BUSINESS_TIMEZONE);
    return isAfter(utcDateTime, /* @__PURE__ */ new Date());
  } catch {
    return false;
  }
}, {
  message: "Odabrani termin mora biti u budućnosti",
  path: ["timeSlot"]
});
const availabilityRequestSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String),
  staffId: z.union([z.string(), z.number()]).transform(String).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nevaljan format datuma")
});
const bookingCreateRequestSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String),
  staffId: z.union([z.string(), z.number()]).transform(String).optional(),
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  startAt: z.string().datetime("Nevaljan ISO datetime format").refine((dateStr) => {
    const date = new Date(dateStr);
    return isFuture(date);
  }, "Datum i vrijeme moraju biti u budućnosti"),
  notes: notesSchema
});
z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELED", "NO_SHOW"]).optional(),
  notes: notesSchema,
  adminId: z.string().optional()
}).partial();
z.object({
  token: z.string().min(1, "Nevaljan cancel token"),
  reason: z.string().max(200, "Razlog ne smije biti duži od 200 znakova").optional()
});

export { availabilityRequestSchema as a, bookingCreateRequestSchema as b };
