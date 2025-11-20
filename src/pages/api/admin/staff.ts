// API route for fetching staff members (admin only)
import type { APIRoute } from 'astro';
import { requireAuth, createAuthenticatedSupabaseClient } from '../../../lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
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

    // Get all staff members using authenticated client (to respect RLS policies)
    // For admin management page, show all staff (including inactive)
    // Check if this is for admin management (owner role)
    const isOwner = authCheck.session.profile.role === 'owner';
    let query = authenticatedClient
      .from('staff_profiles')
      .select('*');
    
    // Only filter by active if not owner (for regular staff view)
    if (!isOwner) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri dohvaćanju djelatnika',
          details: import.meta.env.DEV ? error.message : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const activeStaff = (data || []).map((item) => ({
      id: item.id,
      email: item.email,
      fullName: item.full_name,
      role: item.role,
      active: item.active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: activeStaff,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching staff:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri dohvaćanju djelatnika',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
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
    // Check if user is authenticated and is owner
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

    // Only owner can create staff
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može dodavati djelatnike',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { email, fullName, role, active } = body;

    // Validation
    if (!email || !fullName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email i ime su obavezni',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Note: Creating staff requires creating a Supabase Auth user first
    // This is a simplified version - in production, you'd want to:
    // 1. Create auth user with email/password
    // 2. Create staff_profile linked to that user
    // For now, we'll just return an error suggesting manual creation
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Dodavanje novih djelatnika zahtijeva kreiranje korisničkog računa. Molimo koristite Supabase Auth za kreiranje korisnika, a zatim dodajte profil u staff_profiles tablicu.',
      }),
      {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri kreiranju djelatnika',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is authenticated and is owner
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

    // Only owner can update staff
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može ažurirati djelatnike',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { id, fullName, role, active } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID djelatnika je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Update staff profile
    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await authenticatedClient
      .from('staff_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating staff:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri ažuriranju djelatnika',
          details: import.meta.env.DEV ? error.message : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          active: data.active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating staff:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri ažuriranju djelatnika',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is authenticated and is owner
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

    // Only owner can delete staff
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može obrisati djelatnike',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID djelatnika je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prevent deleting yourself
    if (id === authCheck.session.profile.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ne možete obrisati vlastiti profil',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Soft delete by setting active = false
    const { error } = await authenticatedClient
      .from('staff_profiles')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting staff:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri brisanju djelatnika',
          details: import.meta.env.DEV ? error.message : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error deleting staff:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri brisanju djelatnika',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

