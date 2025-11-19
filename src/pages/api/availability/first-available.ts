// API route for finding the first available slot
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@/lib/supabase';
import { mockServices } from '@/lib/mock-services';
import { createAuthenticatedSupabaseClient } from '@/lib/auth';
import { SlotCalculator, getDefaultBusinessHours } from '@/lib/slots';
import { parseISO, format, addDays, startOfDay } from 'date-fns';

export const prerender = false;

const firstAvailableRequestSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate input data
    const validationResult = firstAvailableRequestSchema.safeParse(body);
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

    const { serviceId, staffId } = validationResult.data;

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
    let authenticatedClient = undefined;
    if (cookies) {
      try {
        const tempClient = createAuthenticatedSupabaseClient(cookies);
        const { data: { user } } = await tempClient.auth.getUser();
        
        if (user) {
          authenticatedClient = tempClient;
        } else {
          authenticatedClient = undefined;
        }
      } catch (err) {
        authenticatedClient = undefined;
      }
    }

    // 5. Get business hours
    const businessHours = await db.getBusinessHours().catch(() => getDefaultBusinessHours());

    // 6. If staffId is not provided, get all staff members to check availability across all
    let staffMembersToCheck: { id: string; name: string }[] = [];
    if (!staffId) {
      try {
        const allStaff = await db.getAllStaffMembers();
        staffMembersToCheck = allStaff
          .filter((s) => s.active)
          .map((s) => ({ id: s.id, name: s.fullName || s.email }));
      } catch (err) {
        console.error('Error fetching staff members:', err);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Greška pri dohvaćanju djelatnika',
          }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } else {
      // If staffId is provided, use it as single staff member to check
      try {
        const staff = await db.getStaffById(staffId);
        if (staff && staff.active) {
          staffMembersToCheck = [{ id: staff.id, name: staff.fullName || staff.email }];
        }
      } catch (err) {
        console.error('Error fetching staff member:', err);
      }
    }

    if (staffMembersToCheck.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nema dostupnih djelatnika',
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 7. Search for first available slot across all staff members (check up to 60 days ahead)
    const today = startOfDay(new Date());
    const maxDays = 60;
    let earliestSlot: { date: string; time: string; staffId: string; staffName: string } | null = null;
    
    for (let dayOffset = 0; dayOffset < maxDays; dayOffset++) {
      const checkDate = addDays(today, dayOffset);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      // Skip Sundays (non-working day)
      if (checkDate.getDay() === 0) {
        continue;
      }
      
      // Get bookings for this date
      let allBookings: any[] = [];
      try {
        allBookings = await db.getBookings(
          {
            dateFrom: dateStr + 'T00:00:00Z',
            dateTo: dateStr + 'T23:59:59Z',
            status: ['CONFIRMED', 'PENDING'],
          },
          authenticatedClient
        );
      } catch (err) {
        console.error('Error fetching bookings for availability:', err);
        allBookings = [];
      }

      // Check availability for each staff member
      for (const staffMember of staffMembersToCheck) {
        // Get time off for this date and staff member
        const timeOff = await db.getTimeOff(dateStr, dateStr, staffMember.id).catch(() => []);
        
        // Filter bookings by staff_id
        const existingBookings = allBookings.filter(
          (booking) => booking.staffId === staffMember.id
        );

        // Calculate available slots for this date and staff member
        const slotDate = parseISO(dateStr);
        const calculator = new SlotCalculator(businessHours, timeOff, existingBookings, staffMember.id);
        const slots = calculator.calculateAvailableSlots(slotDate, service);

        // Find first available slot
        const firstAvailableSlot = slots.find(slot => slot.available);
        
        if (firstAvailableSlot) {
          // Compare with current earliest slot
          if (!earliestSlot) {
            earliestSlot = {
              date: dateStr,
              time: firstAvailableSlot.time,
              staffId: staffMember.id,
              staffName: staffMember.name,
            };
          } else {
            // Compare dates and times to find the earliest
            const currentDateTime = new Date(`${earliestSlot.date}T${earliestSlot.time}`);
            const newDateTime = new Date(`${dateStr}T${firstAvailableSlot.time}`);
            if (newDateTime < currentDateTime) {
              earliestSlot = {
                date: dateStr,
                time: firstAvailableSlot.time,
                staffId: staffMember.id,
                staffName: staffMember.name,
              };
            }
          }
        }
      }

      // If we found a slot for today or tomorrow, we can return early (optimization)
      if (earliestSlot && dayOffset <= 1) {
        break;
      }
    }

    if (earliestSlot) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            date: earliestSlot.date,
            time: earliestSlot.time,
            staffId: earliestSlot.staffId,
            staffName: earliestSlot.staffName,
          },
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // No available slot found within the search period
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Nema dostupnih termina u sljedećih 60 dana',
      }),
      { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error finding first available slot:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri pronalasku prvog slobodnog termina',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
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

