import type { APIRoute } from 'astro';
import { db } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Check if user is authenticated staff
    const authCheck = await requireAuth(request);

    if (!authCheck.authorized || !authCheck.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authCheck.error || 'Nemate pristup ovom resursu',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const serviceId = url.searchParams.get('serviceId');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    // Get bookings
    const filter: any = {};
    
    if (status) {
      filter.status = status.split(',');
    }
    if (serviceId) {
      filter.serviceId = serviceId;
    }
    if (dateFrom) {
      filter.dateFrom = dateFrom;
    }
    if (dateTo) {
      filter.dateTo = dateTo;
    }

    const bookings = await db.getBookings(filter);

    return new Response(
      JSON.stringify({
        success: true,
        data: bookings,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Admin bookings API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri učitavanju rezervacija',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    // Check if user is authenticated staff
    const authCheck = await requireAuth(request);

    if (!authCheck.authorized || !authCheck.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authCheck.error || 'Nemate pristup ovom resursu',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { bookingId, status, notes } = await request.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID rezervacije je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update booking
    const booking = await db.updateBooking(bookingId, {
      status,
      notes,
      adminId: authCheck.session.user.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: booking,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Update booking API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri ažuriranju rezervacije',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

