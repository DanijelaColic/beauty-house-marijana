// API route for managing time-off (slobodni dani)
import type { APIRoute } from 'astro';
import { db } from '@/lib/supabase';
import { createAuthenticatedSupabaseClient, requireAuth } from '@/lib/auth';
import { format, parseISO } from 'date-fns';

export const prerender = false;

// GET - Fetch all time-off entries
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('📋 GET /api/admin/time-off - Starting...');
    
    // Check authentication
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
          details: process.env.NODE_ENV === 'development' ? userError?.message : undefined,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('📥 Fetching time-off list...');
    const timeOffList = await db.getAllTimeOff(authenticatedClient);
    console.log('✅ Retrieved time-off list:', timeOffList.length, 'entries');

    return new Response(
      JSON.stringify({
        success: true,
        data: timeOffList,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error fetching time-off:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri dohvaćanju slobodnih dana',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST - Create new time-off entry
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('📝 POST /api/admin/time-off - Starting...');
    
    // Check authentication
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

    // Check if user is owner
    if (authCheck.session.profile.role !== 'owner') {
      console.error('❌ Non-owner trying to create time-off:', authCheck.session.profile.role);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može upravljati slobodnim danima',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
          details: process.env.NODE_ENV === 'development' ? userError?.message : undefined,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const body = await request.json();
    
    const { name, startDate, endDate, allDay, recurring, active, staffId } = body;

    // Validation
    if (!name || !startDate || !endDate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nedostaju obavezni podaci (naziv, datum od, datum do)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Neispravni datumi',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (start > end) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Datum početka mora biti prije datuma završetka',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('📅 Creating time-off:', {
      name,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      allDay: allDay ?? true,
      recurring: recurring ?? false,
      active: active ?? true,
    });

    try {
      const timeOff = await db.createTimeOff(
        {
          name,
          startDate: start,
          endDate: end,
          allDay: allDay ?? true,
          recurring: recurring ?? false,
          active: active ?? true,
          staffId: staffId || undefined, // If empty string, set to undefined (global)
        },
        authenticatedClient
      );
      
      console.log('✅ Time-off created successfully:', timeOff.id);

      return new Response(
        JSON.stringify({
          success: true,
          data: timeOff,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (dbError: any) {
      console.error('Database error creating time-off:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
      });
      
      // Return more detailed error message
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri kreiranju slobodnog dana',
          details: process.env.NODE_ENV === 'development' 
            ? dbError.message || dbError.details || String(dbError)
            : undefined,
          code: dbError.code,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error creating time-off:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri kreiranju slobodnog dana',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PUT - Update time-off entry
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
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

    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);
    const body = await request.json();
    
    const { id, name, startDate, endDate, allDay, recurring, active, staffId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = parseISO(startDate);
    if (endDate !== undefined) updates.endDate = parseISO(endDate);
    if (allDay !== undefined) updates.allDay = allDay;
    if (recurring !== undefined) updates.recurring = recurring;
    if (active !== undefined) updates.active = active;
    if (staffId !== undefined) updates.staffId = staffId || null; // If empty string, set to null (global)

    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      const start = updates.startDate;
      const end = updates.endDate;
      
      if (start > end) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Datum početka mora biti prije datuma završetka',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const timeOff = await db.updateTimeOff(id, updates, authenticatedClient);

    return new Response(
      JSON.stringify({
        success: true,
        data: timeOff,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error updating time-off:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri ažuriranju slobodnog dana',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// DELETE - Delete time-off entry
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
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

    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await db.deleteTimeOff(id, authenticatedClient);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Slobodan dan je obrisan',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error deleting time-off:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri brisanju slobodnog dana',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

