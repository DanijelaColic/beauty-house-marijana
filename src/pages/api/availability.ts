// API route for checking availability
import type { APIRoute } from 'astro';
import { availabilityRequestSchema } from '../../lib/validation';
import { db } from '../../lib/supabase';
import { mockServices } from '../../lib/mock-services';
import { createAuthenticatedSupabaseClient } from '../../lib/auth';
import { SlotCalculator, getDefaultBusinessHours } from '../../lib/slots';
import { parseISO, format } from 'date-fns';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate input data
    const validationResult = availabilityRequestSchema.safeParse(body);
    if (!validationResult.success) {
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

    const { serviceId, staffId, date } = validationResult.data;

    // 3. Get service details
    let service;
    try {
      service = await db.getServiceById(serviceId);
    } catch (error) {
      console.log('Database error, falling back to mock services:', error);
      service = mockServices.find(s => s.id === serviceId);
    }
    
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

    // 4. Create authenticated client if cookies are available (for staff/admin)
    // For guests (public users), we should use anonymous client to respect RLS policies
    let authenticatedClient = undefined;
    if (cookies) {
      try {
        // Check if there's actually a valid session before creating authenticated client
        const tempClient = createAuthenticatedSupabaseClient(cookies);
        const { data: { user } } = await tempClient.auth.getUser();
        
        if (user) {
          // User is authenticated - use authenticated client
          authenticatedClient = tempClient;
        } else {
          // No valid session - use anonymous client for guests
          authenticatedClient = undefined;
        }
      } catch (err) {
        authenticatedClient = undefined;
      }
    }

    // 5. Get business hours, time off, and existing bookings
    const [businessHours, timeOff] = await Promise.all([
      db.getBusinessHours().catch(() => getDefaultBusinessHours()),
      db.getTimeOff(date, date, staffId).catch(() => []), // Pass staffId to filter time-off
    ]);
    
    // Get bookings - handle errors gracefully but log them for debugging
    let allBookings: any[] = [];
    
    try {
      allBookings = await db.getBookings(
        {
          dateFrom: date + 'T00:00:00Z',
          dateTo: date + 'T23:59:59Z',
          status: ['CONFIRMED', 'PENDING'],
        },
        authenticatedClient
      );
    } catch (err: any) {
      console.error('Error fetching bookings for availability:', err);
      // Return empty array but log the error so we can debug
      allBookings = [];
    }

    // Filter bookings by staff_id if provided
    // NOTE: For guests using mock staff (with IDs like 'staff-4'), we can't filter by staffId
    // because bookings use UUIDs from staff_profiles table. So we show ALL bookings for the date.
    // For authenticated users with real staff IDs (UUIDs), we filter properly.
    let existingBookings = allBookings;
    if (staffId) {
      // Check if staffId is a UUID (real staff) or a mock ID (like 'staff-4')
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staffId);
      
      if (isUUID) {
        // Real staff ID (UUID) - filter bookings by staffId
        existingBookings = allBookings.filter(
          (booking) => booking.staffId === staffId
        );
      } else {
        // Mock staff ID (like 'staff-4') - show ALL bookings for the date
        // because we can't match mock IDs to real staff UUIDs
        existingBookings = allBookings;
      }
    }

    // 5. Calculate available slots
    const slotDate = parseISO(date);
    const calculator = new SlotCalculator(businessHours, timeOff, existingBookings, staffId);
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
