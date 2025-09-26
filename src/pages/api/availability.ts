// API route for checking availability
import type { APIRoute } from 'astro';
import { availabilityRequestSchema } from '@/lib/validation';

export const prerender = false;
import { db } from '@/lib/supabase';
import { SlotCalculator, getDefaultBusinessHours } from '@/lib/slots';
import { parseISO, format } from 'date-fns';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    console.log('Availability request body:', body);
    
    // 2. Validate input data
    const validationResult = availabilityRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Neispravni podaci',
          details: validationResult.error.errors,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { serviceId, date } = validationResult.data;

    // 3. Get service details
    const service = await db.getServiceById(serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usluga nije pronađena',
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 4. Get business hours, time off, and existing bookings
    const [businessHours, timeOff, existingBookings] = await Promise.all([
      db.getBusinessHours().catch(() => getDefaultBusinessHours()),
      db.getTimeOff(date, date).catch(() => []),
      db.getBookings({
        dateFrom: date + 'T00:00:00Z',
        dateTo: date + 'T23:59:59Z',
        status: ['CONFIRMED', 'PENDING'],
      }).catch(() => []),
    ]);

    // 5. Calculate available slots
    const slotDate = parseISO(date);
    const calculator = new SlotCalculator(businessHours, timeOff, existingBookings);
    const slots = calculator.calculateAvailableSlots(slotDate, service);

    // 6. Return response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          date,
          slots,
          service: {
            id: service.id,
            name: service.name,
            duration: service.duration,
          },
        },
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error checking availability:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri provjeri dostupnosti',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
