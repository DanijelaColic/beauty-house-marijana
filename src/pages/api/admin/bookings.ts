import type { APIRoute } from 'astro';
import { db } from '../../../lib/supabase';
import { requireAuth, createAuthenticatedSupabaseClient } from '../../../lib/auth';


export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('📋 GET /api/admin/bookings - Starting...');
    
    // Check if user is authenticated staff (pass cookies for proper session handling)
    const authCheck = await requireAuth(request, cookies);
    
    console.log('🔐 Auth check result:', {
      authorized: authCheck.authorized,
      userId: authCheck.session?.user.id,
      email: authCheck.session?.user.email,
      role: authCheck.session?.profile.role,
      error: authCheck.error,
    });

    if (!authCheck.authorized || !authCheck.session) {
      console.error('❌ Unauthorized access attempt');
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

    // Create authenticated Supabase client to respect RLS policies
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);
    
    // Verify the authenticated client has a session
    const { data: { user: supabaseUser }, error: userError } = await authenticatedClient.auth.getUser();
    console.log('👤 Supabase authenticated user:', {
      userId: supabaseUser?.id,
      email: supabaseUser?.email,
      error: userError?.message,
    });

    if (userError || !supabaseUser) {
      console.error('❌ No Supabase session found:', userError?.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Niste prijavljeni u Supabase',
          details: import.meta.env.DEV ? userError?.message : undefined,
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

    // Get bookings using authenticated client
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

    console.log('🔍 Fetching bookings with filter:', filter);
    const bookings = await db.getBookings(filter, authenticatedClient);
    console.log('✅ Retrieved bookings:', bookings.length);

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
  } catch (err: any) {
    console.error('❌ Admin bookings API error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri učitavanju rezervacija',
        details: import.meta.env.DEV ? err.message : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('📝 POST /api/admin/bookings - Creating booking...');
    
    // Check if user is authenticated staff
    const authCheck = await requireAuth(request, cookies);

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

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    const body = await request.json();
    const {
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      startAt,
      notes,
      staffId, // Optional: admin can specify staff, staff can only use their own ID
    } = body;

    // Validation
    if (!serviceId || !clientName || !clientEmail || !startAt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nedostaju obavezni podaci (usluga, ime klijenta, email, datum)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Both admin and staff can create bookings for anyone
    // If staffId is provided, use it; otherwise leave it undefined
    let finalStaffId = staffId || undefined;

    console.log('📝 Creating booking:', {
      serviceId,
      clientName,
      clientEmail,
      staffId: finalStaffId,
      userRole: authCheck.session.profile.role,
    });

    // Create booking using authenticated client
    const booking = await db.createBooking(
      {
        serviceId,
        clientName,
        clientEmail,
        clientPhone,
        startAt,
        notes,
        staffId: finalStaffId,
      },
      authenticatedClient
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: booking,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('❌ Create booking API error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri kreiranju rezervacije',
        details: import.meta.env.DEV ? err.message : undefined,
        code: import.meta.env.DEV ? err.code : undefined,
        hint: import.meta.env.DEV ? err.hint : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is authenticated staff (pass cookies for proper session handling)
    const authCheck = await requireAuth(request, cookies);

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

    // Create authenticated Supabase client to respect RLS policies
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

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

    // Update booking using authenticated client
    const booking = await db.updateBooking(bookingId, {
      status,
      notes,
      adminId: authCheck.session.user.id,
    }, authenticatedClient);

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

