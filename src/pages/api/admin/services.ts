// API route for managing services (admin only)
import type { APIRoute } from 'astro';
import { requireAuth, createAuthenticatedSupabaseClient } from '@/lib/auth';
import { db } from '@/lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
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

    // Only owner can manage services
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može upravljati uslugama',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Get all services (including inactive)
    const { data, error } = await authenticatedClient
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri dohvaćanju usluga',
          details: import.meta.env.DEV ? error.message : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const services = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      duration: item.duration,
      price: item.price,
      active: item.active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: services,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri dohvaćanju usluga',
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

    // Only owner can create services
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može kreirati usluge',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { name, description, duration, price, active } = body;

    // Validation
    if (!name || !duration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Naziv i trajanje su obavezni',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Insert service
    const { data, error } = await authenticatedClient
      .from('services')
      .insert({
        name,
        description: description || null,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri kreiranju usluge',
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
          name: data.name,
          description: data.description || '',
          duration: data.duration,
          price: data.price,
          active: data.active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri kreiranju usluge',
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

    // Only owner can update services
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može ažurirati usluge',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { id, name, description, duration, price, active } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID usluge je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Update service
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await authenticatedClient
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri ažuriranju usluge',
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
          name: data.name,
          description: data.description || '',
          duration: data.duration,
          price: data.price,
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
    console.error('Error updating service:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri ažuriranju usluge',
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

    // Only owner can delete services
    if (authCheck.session.profile.role !== 'owner') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Samo vlasnik može obrisati usluge',
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
          error: 'ID usluge je obavezan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create authenticated Supabase client
    const authenticatedClient = createAuthenticatedSupabaseClient(cookies);

    // Delete service (soft delete by setting active = false, or hard delete)
    // For safety, we'll do soft delete
    const { error } = await authenticatedClient
      .from('services')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Greška pri brisanju usluge',
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
    console.error('Error deleting service:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri brisanju usluge',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

