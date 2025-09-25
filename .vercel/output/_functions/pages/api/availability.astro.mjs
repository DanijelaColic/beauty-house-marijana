import { a as availabilityRequestSchema } from '../../chunks/validation_DlZn1w71.mjs';
import { d as db } from '../../chunks/supabase_lS9oiJyB.mjs';
import { addMinutes, isWithinInterval, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
export { renderers } from '../../renderers.mjs';

const BUSINESS_TIMEZONE = "Europe/Zagreb";
const SLOT_INTERVAL = 15;
class SlotCalculator {
  constructor(businessHours, timeOff, existingBookings) {
    this.businessHours = businessHours;
    this.timeOff = timeOff;
    this.existingBookings = existingBookings;
  }
  /**
   * Calculate available time slots for a specific date and service
   */
  calculateAvailableSlots(date, service) {
    const dayOfWeek = date.getDay();
    const businessHour = this.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
    if (!businessHour || !businessHour.active) {
      return [];
    }
    if (this.isDateInTimeOff(date)) {
      return [];
    }
    const allSlots = this.generateSlotsForBusinessHour(businessHour, date);
    const availableSlots = allSlots.map((slot) => {
      const slotStart = this.createSlotDateTime(date, slot.time);
      const slotEnd = addMinutes(slotStart, service.duration);
      const isBooked = this.isSlotBooked(slotStart, slotEnd);
      const now = /* @__PURE__ */ new Date();
      const isInPast = slotStart <= now;
      const fitsInBusinessHours = this.slotFitsInBusinessHours(
        businessHour,
        slot.time,
        service.duration
      );
      let available = !isBooked && !isInPast && fitsInBusinessHours;
      let reason;
      if (isBooked) {
        reason = "Zauzeto";
      } else if (isInPast) {
        reason = "Prošlo vrijeme";
      } else if (!fitsInBusinessHours) {
        reason = "Izvan radnog vremena";
      }
      return {
        time: slot.time,
        available,
        reason
      };
    });
    return availableSlots;
  }
  /**
   * Generate all possible time slots for a business hour
   */
  generateSlotsForBusinessHour(businessHour, date) {
    const slots = [];
    const [startHour, startMinute] = businessHour.startTime.split(":").map(Number);
    const [endHour, endMinute] = businessHour.endTime.split(":").map(Number);
    let currentHour = startHour;
    let currentMinute = startMinute;
    if (currentMinute % SLOT_INTERVAL !== 0) {
      currentMinute = Math.ceil(currentMinute / SLOT_INTERVAL) * SLOT_INTERVAL;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    while (currentHour < endHour || currentHour === endHour && currentMinute < endMinute) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      if (!this.isTimeInBreak(timeString, businessHour.breaks || [])) {
        slots.push({
          time: timeString,
          available: true
          // Will be determined later
        });
      }
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
  isTimeInBreak(time, breaks) {
    const [hour, minute] = time.split(":").map(Number);
    const timeInMinutes = hour * 60 + minute;
    return breaks.some((breakPeriod) => {
      const [startHour, startMinute] = breakPeriod.start.split(":").map(Number);
      const [endHour, endMinute] = breakPeriod.end.split(":").map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;
      return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    });
  }
  /**
   * Check if a slot fits within business hours considering service duration
   */
  slotFitsInBusinessHours(businessHour, slotTime, serviceDuration) {
    const [slotHour, slotMinute] = slotTime.split(":").map(Number);
    const [endHour, endMinute] = businessHour.endTime.split(":").map(Number);
    const slotStartInMinutes = slotHour * 60 + slotMinute;
    const slotEndInMinutes = slotStartInMinutes + serviceDuration;
    const businessEndInMinutes = endHour * 60 + endMinute;
    return slotEndInMinutes <= businessEndInMinutes;
  }
  /**
   * Create a Date object for a specific slot time on a given date
   */
  createSlotDateTime(date, time) {
    const [hour, minute] = time.split(":").map(Number);
    const localDate = new Date(date);
    localDate.setHours(hour, minute, 0, 0);
    return zonedTimeToUtc(localDate, BUSINESS_TIMEZONE);
  }
  /**
   * Check if a slot time range conflicts with existing bookings
   */
  isSlotBooked(slotStart, slotEnd) {
    return this.existingBookings.some((booking) => {
      const bookingStart = booking.startAt;
      const bookingEnd = booking.endAt;
      return slotStart < bookingEnd && slotEnd > bookingStart && booking.status !== "CANCELED";
    });
  }
  /**
   * Check if a date is within a time-off period
   */
  isDateInTimeOff(date) {
    return this.timeOff.some((timeOff) => {
      if (!timeOff.active) return false;
      return isWithinInterval(date, {
        start: timeOff.startDate,
        end: timeOff.endDate
      });
    });
  }
}
function getDefaultBusinessHours() {
  return [
    {
      id: "1",
      dayOfWeek: 1,
      // Monday
      startTime: "08:00",
      endTime: "20:00",
      active: true,
      breaks: [{ start: "12:00", end: "13:00" }],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "2",
      dayOfWeek: 2,
      // Tuesday
      startTime: "08:00",
      endTime: "20:00",
      active: true,
      breaks: [{ start: "12:00", end: "13:00" }],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "3",
      dayOfWeek: 3,
      // Wednesday
      startTime: "08:00",
      endTime: "20:00",
      active: true,
      breaks: [{ start: "12:00", end: "13:00" }],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "4",
      dayOfWeek: 4,
      // Thursday
      startTime: "08:00",
      endTime: "20:00",
      active: true,
      breaks: [{ start: "12:00", end: "13:00" }],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "5",
      dayOfWeek: 5,
      // Friday
      startTime: "08:00",
      endTime: "20:00",
      active: true,
      breaks: [{ start: "12:00", end: "13:00" }],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "6",
      dayOfWeek: 6,
      // Saturday
      startTime: "08:00",
      endTime: "14:00",
      active: true,
      breaks: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }
  ];
}

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("Availability request body:", body);
    const validationResult = availabilityRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Validation errors:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Neispravni podaci",
          details: validationResult.error.errors
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const { serviceId, date } = validationResult.data;
    const service = await db.getServiceById(serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usluga nije pronađena"
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const [businessHours, timeOff, existingBookings] = await Promise.all([
      db.getBusinessHours().catch(() => getDefaultBusinessHours()),
      db.getTimeOff(date, date).catch(() => []),
      db.getBookings({
        dateFrom: date + "T00:00:00Z",
        dateTo: date + "T23:59:59Z",
        status: ["CONFIRMED", "PENDING"]
      }).catch(() => [])
    ]);
    const slotDate = parseISO(date);
    const calculator = new SlotCalculator(businessHours, timeOff, existingBookings);
    const slots = calculator.calculateAvailableSlots(slotDate, service);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          date,
          slots,
          service: {
            id: service.id,
            name: service.name,
            duration: service.duration
          }
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error checking availability:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri provjeri dostupnosti"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
